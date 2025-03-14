import json

from google.api_core.exceptions import AlreadyExists
from google.api_core.exceptions import NotFound
from google.cloud import pubsub_v1
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from src.config import src_setting
from src.webhook.utils import should_renew_watch
from src.webhook.utils import store_watch_info

core_api = "http://area-core-api:8080/api/v1"

# TODO see the should rewaatch, the creatino and delet of subcripton and why ()
# TODO two possiblity same endpoint or different endpoint -> see both


# ! MAIN ENDPOINT
async def create_gmail_webhook(args: list, event: str, oauth_token: str, user_id: int):
    print("args sended from the frontend", args)
    PROJECT_ID = args[0]
    TOPIC_NAME = args[1]
    from_email = len(args) > 2 and args[2] or None
    SUBSCRIPTION_NAME = f"EMAIL_SUBSCRIPTION_{user_id}"
    TOPIC_FULL_NAME = f"projects/{PROJECT_ID}/topics/{TOPIC_NAME}"

    # Use the OAuth 2.0 token for Gmail API authentication
    creds = Credentials(token=oauth_token)

    service = build("gmail", "v1", credentials=creds)
    user_profile = service.users().getProfile(userId="me").execute()
    email_address = user_profile["emailAddress"]

    print(f"Creating Gmail webhook for user {email_address}")

    request = {
        "topicName": TOPIC_FULL_NAME,
        "labelIds": ["INBOX", "SENT"],
        "labelFilterAction": "include",
        "filter": "-in:drafts",
    }

    if event == "email_received":
        request["labelIds"] = ["INBOX"]
        request["labelFilterAction"] = "include"
    elif event == "email_sent":
        request["labelIds"] = ["SENT"]
        request["labelFilterAction"] = "include"
    elif event == "email_received_from_person":
        if not from_email:
            print("Please provide the email address of the person.")
            return
        request["labelIds"] = ["INBOX"]
        request["labelFilterAction"] = "include"
        request["filter"] = f"from:{from_email}"
    elif event == "email_sent_to_person":
        if not from_email:
            print("Please provide the email address of the person.")
            return
        request["labelIds"] = ["SENT"]
        request["labelFilterAction"] = "include"
        request["filter"] = f"to:{from_email}"
    else:
        print("Unsupported event")
        return

    # Create the Pub/Sub subscription with service account credentials
    create_push_subscription(
        PROJECT_ID, TOPIC_NAME, SUBSCRIPTION_NAME, f"{src_setting.NGROK_FORWARD_URL}/api/v1/webhook", user_id
    )

    # Check if the watch needs to be renewed
    # TODO -> in should renew watch only if the sub is in place (since can be deleted)
    if not await should_renew_watch(email_address):
        print("Watch is still active; no need to renew.")
        return

    try:
        response = service.users().watch(userId="me", body=request).execute()
        print("Watch request successful:", response)

        resource_id = response.get("resourceId")
        # if not resource_id:
        #     print("No resourceId found in the watch response.")
        #     return

        # Store the watch information
        await store_watch_info(response, email_address, resource_id, user_id)
        print("Watch stored successfully.")
    except Exception as e:
        print("An error occurred:", e)


def create_push_subscription(project_id, topic_name, subscription_name, endpoint_url, user_id):
    # Load service account credentials
    credentials = service_account.Credentials.from_service_account_file("service_key.json")

    subscriber = pubsub_v1.SubscriberClient(credentials=credentials)
    print(f"Creating subscription '{subscription_name}' with push endpoint '{endpoint_url}'")

    topic_path = subscriber.topic_path(project_id, topic_name)
    subscription_path = subscriber.subscription_path(project_id, subscription_name)

    # Add custom attributes like user_id
    push_config = pubsub_v1.types.PushConfig(push_endpoint=endpoint_url)

    try:
        existing_subscription = subscriber.get_subscription(subscription=subscription_path)
        existing_endpoint = existing_subscription.push_config.push_endpoint
        should_delete = False # Think of a condition
        if should_delete:
            delete_user_subscription(project_id, user_id)
            print(f"SUBSCRIPTION '{subscription_name}' DELETED.")
            return
            # Proceed to create a new subscription
        if existing_endpoint == endpoint_url:
            print(f"Subscription '{subscription_name}' already exists with the same endpoint.")
            return
        else:
            print(f"Subscription '{subscription_name}' exists but with a different endpoint.")
            update_mask = {"paths": ["push_config.push_endpoint", "push_config.attributes"]}
            subscriber.update_subscription(
                subscription={
                    "name": subscription_path,
                    "push_config": push_config,
                },
                update_mask=update_mask,
            )
            print(f"Subscription '{subscription_name}' updated with new endpoint and attributes.")
            return
    except NotFound:
        print("SUB NOT FOUND -> CREATING NEW SUB")
        pass
    except Exception as e:
        print(f"An error occurred while checking the subscription: {e}")
        return

    try:
        print("Subscription does not exist; creating a new one.")
        subscription = subscriber.create_subscription(
            name=subscription_path,
            topic=topic_path,
            push_config=push_config,
        )
        print(f"Push subscription created: {subscription.name}")
    except AlreadyExists:
        print(f"Subscription '{subscription_name}' already exists.")
    except Exception as e:
        print(f"An error occurred while creating the subscription: {e}")


# NOT USED FOR NOW
def delete_all_subscriptions_for_topic(project_id, topic_name, subscriber):
    # Load service account credentials

    topic_path = subscriber.topic_path(project_id, topic_name)

    try:
        # List all subscriptions for the project
        project_path = f"projects/{project_id}"
        subscriptions = subscriber.list_subscriptions(request={"project": project_path})

        # Filter subscriptions that are associated with the given topic
        subscriptions_to_delete = [subscription for subscription in subscriptions if subscription.topic == topic_path]

        if not subscriptions_to_delete:
            print(f"No subscriptions found for topic '{topic_name}'.")
            return

        for subscription in subscriptions_to_delete:
            subscriber.delete_subscription(subscription=subscription.name)
            print(f"Subscription '{subscription.name}' deleted successfully.")
    except Exception as e:
        print(f"An error occurred while deleting subscriptions: {e}")


def delete_user_subscription(project_id: str, user_id: int):
    subscription_name = f"EMAIL_SUBSCRIPTION_{user_id}"
    credentials = service_account.Credentials.from_service_account_file("service_key.json")
    subscriber = pubsub_v1.SubscriberClient(credentials=credentials)
    subscription_path = subscriber.subscription_path(project_id, subscription_name)
    try:
        subscriber.delete_subscription(subscription=subscription_path)
        print(f"Deleted subscription '{subscription_name}' for user_id {user_id}")
    except NotFound:
        print(f"Subscription '{subscription_name}' not found for deletion.")
    except Exception as e:
        print(f"An error occurred while deleting the subscription: {e}")
