# package-specific business logic
import requests
from src.config import src_setting

def repository_create_webhook(args: list, event: str, oauth_token: str):
    print("args sended from the frontend", args)
    print("event", event)
    if len(args) < 2:
        print("Please provide the owner and repository name.")
        return
    owner = args[0]
    repo_name = args[1]
    print("auth", oauth_token)
    headers = {
        "Authorization": f"token {oauth_token}",
        "Accept": "application/vnd.github+json",
    }

    print("Owner:", repr(owner))
    print("Repository Name:", repr(repo_name))
    print("ngork", src_setting.NGROK_FORWARD_URL);
    print("secret", src_setting.SECRET_KEY);

    print(f"Creating webhook for {event} event on {owner}/{repo_name}...")
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}/hooks"
    payload = {
        "name": "web",
        "active": True,
        "events": [event],
        "config": {
            "url": f"{src_setting.NGROK_FORWARD_URL}/api/v1/webhook",
            "content_type": "json",
            "secret": src_setting.SECRET_KEY,
            "insecure_ssl": "0",
        },
    }

    # Retrieve existing webhooks
    response = requests.get(api_url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to retrieve webhooks: {response.status_code}")
        print(response.json())
        return

    existing_webhooks = response.json()

    # Check if a webhook with the same configuration already exists
    for webhook in existing_webhooks:
        # Compare the events
        existing_events = set(webhook.get("events", []))
        desired_events = set(payload["events"])

        # Compare configurations
        existing_config = webhook.get("config", {})
        desired_config = payload["config"]

        keys_to_compare = ["url", "content_type", "insecure_ssl"]

        config_matches = all(existing_config.get(key) == desired_config.get(key) for key in keys_to_compare)

        events_match = existing_events == desired_events

        if config_matches and events_match:
            print("A webhook with the same configuration already exists.")
            return

    # If no match, create a new webhook
    response = requests.post(api_url, headers=headers, json=payload)
    if response.status_code == 201:
        print("Webhook created successfully.")
    else:
        print(f"Failed to create webhook: {response.status_code}")
        print(response.json())
