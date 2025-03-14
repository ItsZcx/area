# Router with the endpoints
import base64
import datetime
import hashlib
import hmac
import json
from typing import List
from typing import Tuple

import requests
from fastapi import APIRouter
from fastapi import Header
from fastapi import HTTPException
from fastapi import Request

# from src.webhook.schemas import EventPayload
# from src.webhook.schemas import PullRequestEvent
# from src.webhook.schemas import PushEvent
# from src.webhook.schemas import WorkflowRunEvent
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pydantic import ValidationError

from src.config import src_setting
from src.webhook.schemas import EmailReceivedEvent
from src.webhook.schemas import EventPayload
from src.webhook.schemas import Message
from src.webhook.utils import get_user_info_by_userid
from src.webhook.utils import store_watch_info

router = APIRouter(prefix="/webhook", tags=["Webhook"])


@router.post("")
async def webhook_listener(request: Request):
    # Extract and verify the message from Pub/Sub
    # TODO -> see why this not called, maybe history id and should renew not working but it's okay...
    print("WEBHOOK LISTENER HIT")
    envelope = await request.json()

    print("Received envelope:", envelope)

    message = envelope.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="No message in envelope")

    print("Message:", message)
    data = message.get("data")
    if not data:
        raise HTTPException(status_code=400, detail="No data in message")

    # Decode the base64-encoded data
    print("BEFORE DECODE")
    payload = base64.b64decode(data).decode("utf-8")
    payload_json = json.loads(payload)
    print("Received message:", payload_json)

    # user_email = payload_json.get('emailAddress')
    from_email = payload_json.get("emailAddress")
    history_id = payload_json.get("historyId")

    print(f"AFTER DECODE")
    subscription = envelope.get("subscription")
    print(f"Subscription: {subscription}")
    if not subscription:
        raise HTTPException(status_code=400, detail="No subscription in envelope")

    # Extract user_id from subscription name
    subscription_name = subscription.split("/")[-1]
    print(f"Subscription name: {subscription_name}")
    prefix = "EMAIL_SUBSCRIPTION_"
    if subscription_name.startswith(prefix):
        user_id_str = subscription_name[len(prefix) :]
        try:
            user_id = int(user_id_str)
            print(f"Extracted user_id: {user_id}")
        except ValueError:
            print(f"Invalid user_id in subscription name: {user_id_str}")
            raise HTTPException(status_code=400, detail="Invalid user_id in subscription name")
    else:
        print(f"Subscription name does not start with expected prefix '{prefix}'")
        raise HTTPException(status_code=400, detail="Invalid subscription name format")

    print(f"Received user_id from headers: {user_id}")

    # get all the user info necessary-> get all the user, email, token, gmail_webhook_info
    user_info = await get_user_info_by_userid(user_id)

    print("User info:", user_info)
    ## user
    if not user_info:
        print(f"No user found for user_id {user_id}")
        return {"status": "User not found"}

    user_email_address = user_info.get("email")
    oauth_token = user_info["token"]["google_token"]["access_token"]
    if not oauth_token:
        print(f"No OAuth token found for user with resourceId {user_id}")
        return {"status": "No credentials"}

    print("Email address on payload:", from_email)
    print("History ID on payload:", history_id)

    history_id = payload_json.get("historyId")
    if not from_email or not history_id:
        print("Invalid payload: Missing emailAddress or historyId")
        return {"status": "Invalid payload"}

    creds = Credentials(token=oauth_token)
    if not creds:
        print(f"No credentials found for user {user_email_address}")
        return {"status": "No credentials"}

    # Process Gmail changes, no need for this
    last_history_id = user_info.get("gmail_webhook_info", {}).get("gmail_history_id")
    if not last_history_id:
        print(f"No stored historyId for user {from_email}")
        # Use the historyId from the notification as the starting point
        last_history_id = history_id

    eventPayloads, new_history_id = process_gmail_changes(
        user_email_address, from_email, last_history_id, creds, user_id
    )

    # Store the new historyId
    await store_watch_info(payload_json, new_history_id, "", user_id)

    for eventPayload in eventPayloads:
        if eventPayload:
            print("Posting event to core-api")
            print(eventPayload)

            print("EMULATE POSTING EVENT TO CORE API")
            response = requests.post("http://area-core-api:8080/api/v1/events", json=eventPayload.dict())
            print(response)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to post event: {response.text}",
                )
    return {"status": "success"}


def process_gmail_changes(
    user_email_address, from_email, start_history_id, creds, user_id
) -> Tuple[List[EventPayload], str]:
    service = build("gmail", "v1", credentials=creds)
    page_token = None
    eventPayloads = []
    new_history_id = start_history_id

    try:
        while True:
            history_response = (
                service.users()
                .history()
                .list(userId="me", startHistoryId=start_history_id, pageToken=page_token)
                .execute()
            )

            # print(f"History response: {history_response}")

            if "history" in history_response:
                new_history_id = history_response["historyId"]
                for history_record in history_response["history"]:
                    if "messagesAdded" in history_record:
                        for msg in history_record["messagesAdded"]:
                            message_id = msg["message"]["id"]

                            # Fetch message details with exception handling
                            try:
                                message_detail = (
                                    service.users().messages().get(userId="me", id=message_id, format="full").execute()
                                )
                            except HttpError as e:
                                if e.resp.status == 404:
                                    print(f"Message {message_id} not found, skipping.")
                                    continue
                                else:
                                    print(f"Error fetching message {message_id}: {e}")
                                    continue  # or handle other errors as needed

                            # print(f"Message detail: {message_detail}")

                            labels = message_detail.get("labelIds", [])

                            if "DRAFT" in labels:
                                continue

                            # Get the timestamp of the message
                            message_ts = int(message_detail.get("internalDate")) / 1000  # Convert to seconds
                            message_datetime = datetime.datetime.fromtimestamp(message_ts)

                            # Get current time
                            now = datetime.datetime.utcnow()

                            # If message is older than 10 minutes, skip it
                            if (now - message_datetime).total_seconds() > 600:
                                continue

                            if "SENT" in labels or "INBOX" in labels:
                                print(f"Processing message ID: {message_id}")
                                [from_address, subject] = get_from_address_and_subject(message_detail)

                                # Determine event type

                                print(f"FROM ADDRESS: {from_address} and USER EMAIL ADDRESS: {user_email_address}")
                                event_type = "email_sent" if from_address == user_email_address else "email_received"

                                print(f"EVENT TYPE: {event_type}")
                                # Get 'To' email address
                                to_email = get_header_value(message_detail["payload"]["headers"], "To")

                                print("TO EMAIL WITHOUT PROCESSING", to_email)

                                # Prepare params
                                params = {"email": user_email_address}
                                if event_type == "email_sent":
                                    # area-core-api             | 2024-10-24T15:09:34.851671627Z event_context_params {'subject': 'This is a test', 'message': 'Hello testing appliciton', 'to': 'David Salvatella <david.salvatella.gelpi@gmail.com>', 'from': 'david.salvatella.gelpi@gmail.com'}
                                    # strip the to to only get email address
                                    if "<" in to_email and ">" in to_email:
                                        to_email = to_email.split("<")[1].split(">")[0]
                                    else:
                                        to_email = to_email.strip()

                                    print("TO EMAIL AFTER PROCESSING", to_email)
                                    params = {"email": user_email_address, "to": to_email}

                                eventPayload = EventPayload(
                                    event_name=event_type,
                                    service="google",
                                    params=params,
                                    context_params={
                                        "subject": subject,
                                        "message": message_detail.get("snippet"),
                                        "to": to_email,
                                        "from": from_address,
                                    },
                                    processed_message_info={"message_id": message_id, "user_id": str(user_id)},
                                )

                                eventPayloads.append(eventPayload)
            else:
                print("No history records.")

            if "nextPageToken" in history_response:
                page_token = history_response["nextPageToken"]
            else:
                break

    except HttpError as e:
        if e.resp.status == 404:
            print(f"History ID {start_history_id} is too old or invalid.")
            # Handle the case where the history ID is invalid or too old
            # You might need to perform a full sync or update the history ID
        else:
            print(f"Failed to retrieve history: {e}")

    return eventPayloads, new_history_id


def get_from_address_and_subject(data):
    if "payload" in data and "headers" in data["payload"]:
        headers = data["payload"]["headers"]
        from_value = get_header_value(headers, "From")
        subject = get_header_value(headers, "Subject")
        import re

        match = re.search(r"<(.+?)>", from_value)
        if match:
            email_address = match.group(1)
        else:
            email_address = from_value
        return [email_address, subject]
    else:
        print("No headers found in the payload.")
    return [None, None]


def get_header_value(headers, name):
    for header in headers:
        if header["name"].lower() == name.lower():
            return header["value"]
    return None


def is_valid_signature(body, signature, secret):
    if not signature:
        return False  # Signature is missing
    mac = hmac.new(secret.encode(), msg=body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(expected_signature, signature)
