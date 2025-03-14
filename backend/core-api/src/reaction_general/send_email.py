# This file is made for putting all the actions that can be executed by the tasks

import smtplib
from email.message import EmailMessage

from email_validator import EmailNotValidError
from email_validator import validate_email

from src.config import EnvFileLoader
from src.llm.llm import get_openai_client


# SMTP configuration
class ReactionGeneralSetting(EnvFileLoader):
    SMTP_SERVER: str
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM: str = "hello@demomailtrap.com"


reaction_general_setting = ReactionGeneralSetting()

aiClient = get_openai_client()


def generate_email_content(task, db=None, **kwargs):
    # Dynamically build the context string based on the provided kwargs
    event_details = ", ".join([f"{key}: '{value}'" for key, value in kwargs.items()])

    print("event_details on send_email reaction", event_details)

    # Construct the notification message
    context = (
        f"User '{task.user.username}' triggered the event '{task.trigger}'"
        f"{' with the following details: ' + event_details if event_details else '.'}"
    )

    # Refined prompt for email generation
    prompt = (
        f"Compose a brief and professional email to notify the user that an event has occurred. Explicitly mention to whom the email is addressed and who the sender is. Try to understand from what service does the event comfe from, we have google and github at the moment and addapt the response to it\n\n"
        f"Do it as close as a human text as possible try to understand the event and explain it brieflly to the user, do not use a schematic whay to response or bulletpoints, redact a coherent text. The sender name is Operations team and the enterpise is Area-Epitech \n\n"
        f"Event Details:\n{context}\n\nEmail:\n\nDear {task.user.first_name},"
    )

    completion = aiClient.chat.completions.create(
        model="gpt-3.5-turbo", messages=[{"role": "system", "content": prompt}]
    )

    email_content = completion.choices[0].message.content
    return email_content


def send_email_via_smtp(recipient_email, email_content):
    try:
        valid = validate_email(recipient_email)
        recipient_email = valid.email
    except EmailNotValidError as e:
        print(f"Invalid email address: {e}")
        return

    print("Sender email: ", reaction_general_setting.SMTP_FROM)

    msg = EmailMessage()
    msg["Subject"] = "Notification from Your Service"
    msg["From"] = reaction_general_setting.SMTP_FROM  # Use a valid "From" email
    msg["To"] = recipient_email
    msg.set_content(email_content)

    try:
        with smtplib.SMTP(reaction_general_setting.SMTP_SERVER, reaction_general_setting.SMTP_PORT) as server:
            server.starttls()
            server.login(
                reaction_general_setting.SMTP_USERNAME,
                reaction_general_setting.SMTP_PASSWORD,
            )  # Correct login credentials
            server.send_message(msg)
            print(f"Email successfully sent to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def send_email(service_from=None, task=None, **kwargs):
    print("Email function hit....")
    email_content = generate_email_content(task, **kwargs)
    print("After email content")
    recipient_email = task.user.email
    send_email_via_smtp(recipient_email, email_content)
    print(f"Email sent to {recipient_email} with content:\n{email_content}")
    return f"Email sent to {recipient_email}"
