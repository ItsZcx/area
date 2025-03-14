# Description: Utility functions for setting up and managing Gmail watch (making sure the watch is active and renewing it if necessary, normally its 7 days).
import datetime
import json
import os

import aiohttp
import httpx
import requests

core_api = "http://area-core-api:8080/api/v1"


async def store_watch_info(response, email_address, resource_id, user_id):
    """Stores the watch expiration and history ID."""
    print(f"STORING WATHC INFO: {response}")
    history_id = response.get("historyId")
    expiration = response.get("expiration")

    print(f"History ID: {history_id}")
    print(f"Expiration: {expiration}")

    if expiration is None or expiration == "":
        print("No expiration provided; skipping expiration processing.")
        return  # Or handle it in another way (e.g., default expiration)

    if history_id:
        # Store the historyId in your database associated with the email_address
        # Example: save to a database or a persistent storage
        expiration_datetime = datetime.datetime.utcfromtimestamp(int(expiration) / 1000)
        await save_history_id_to_db(email_address, history_id, expiration_datetime, resource_id, user_id)
    else:
        print("No historyId found in the watch response.")


async def save_history_id_to_db(email_address, history_id, expiration, resource_id, user_id):
    # Implement this function to save the history_id associated with the email_address
    expiration = expiration.isoformat()
    if resource_id is None:
        resource_id = ""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{core_api}/users/gmail/watch_info/{email_address}",
                json={
                    "gmail_history_id": int(history_id),
                    "gmail_expiration_date": expiration,
                    "resource_id": resource_id,
                    "user_id": user_id,
                },
            )
        if response.status_code != 200:
            print(f"Failed to save history id for {email_address}: {response.text}")
        else:
            print(f"History id saved for {email_address}")
    except Exception as e:
        print(f"An error occurred while saving the history id: {e}")


# return of this func
# {
#   "id": 1,
#   "email": "user@example.com",
#   "token": {
#     "google_token": {
#       "access_token": "ya29.a0ARrdaM...",
#       "refresh_token": "1//0g...",
#       "expires_in": 3599,
#       "scope": "https://www.googleapis.com/auth/gmail.readonly",
#       "token_type": "Bearer",
#       "id_token": null
#     }
#   },
#   "gmail_webhook_info": {
#     "gmail_history_id": "123456789",
#     "gmail_expiration_date": "2024-10-23T12:00:00",
#     "resource_id": "resource_id_value"
#   }
# }


async def get_user_info_by_userid(user_id: str):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{core_api}/users/gmail/watch_info/user_id/{user_id}") as response:
                if response.status == 200:
                    watch_info = await response.json()
                    return watch_info
                else:
                    text = await response.text()
                    print(f"Failed to load watch info for {user_id}: {text}")
                    return None
    except Exception as e:
        print(f"An error occurred while loading the watch info: {e}")
        return None


async def load_watch_info(email_address):
    """Loads the watch expiration and history ID for a user from the database."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{core_api}/users/gmail/watch_info/{email_address}") as response:
                if response.status == 200:
                    watch_info = await response.json()
                    return watch_info
                else:
                    text = await response.text()
                    print(f"Failed to load watch info for {email_address}: {text}")
                    return None
    except Exception as e:
        print(f"An error occurred while loading the watch info: {e}")
        return None


async def should_renew_watch(email_address):
    watch_info = await load_watch_info(email_address)
    if not watch_info:
        return True

    print(f"Watch info: {watch_info}")
    expiration_time = datetime.datetime.fromisoformat(watch_info["gmail_expiration_date"])
    if expiration_time.tzinfo is None:
        # Assume the expiration time is in UTC and make it timezone-aware
        expiration_time = expiration_time.replace(tzinfo=datetime.timezone.utc)
    current_time = datetime.datetime.now(datetime.timezone.utc)

    # Renew the watch if it's within 24 hours of expiring
    if expiration_time - current_time <= datetime.timedelta(hours=24):
        print("Watch is expiring soon; need to renew.")
        return True
    else:
        print("Watch is still active.")
        return False


# NOT USED FOR NOW
async def get_stored_history_id(email_address):
    # Implement this function to load the history_id associated
    try:
        watch_info = await load_watch_info(email_address)
        if watch_info:
            return watch_info["gmail_history_id"]
        else:
            return None
    except Exception as e:
        print(f"An error occurred while loading the watch info: {e}")
        return None


# {
#   "id": 1,
#   "email": "user@example.com",
#   "token": {
#     "google_token": {
#       "access_token": "ya29.a0ARrdaM...",
#       "refresh_token": "1//0g...",
#       "expires_in": 3599,
#       "scope": "https://www.googleapis.com/auth/gmail.readonly",
#       "token_type": "Bearer",
#       "id_token": null
#     }
#   },
#   "gmail_webhook_info": {
#     "gmail_history_id": "123456789",
#     "gmail_expiration_date": "2024-10-23T12:00:00",
#     "resource_id": "resource_id_value"
#   }
# }
