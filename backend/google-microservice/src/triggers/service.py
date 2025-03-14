# package-specific business logic

from src.webhook.service import create_gmail_webhook


async def any_email_received_webhook(args: list, oauth_token: str, user_id: int):
    print("any_email_received_webhook HIT")
    await create_gmail_webhook(args, "email_received", oauth_token, user_id)


async def email_received_from_person_webhook(args: list, oauth_token: str, user_id: int):
    print("email received from person hit HIT")
    await create_gmail_webhook(args, "email_received_from_person", oauth_token, user_id)


async def email_sent_webhook(args: list, oauth_token: str, user_id: int):
    print("email sent HIT")
    await create_gmail_webhook(args, "email_sent", oauth_token, user_id)
