from twilio.rest import Client

from src.config import EnvFileLoader
from src.llm.llm import get_openai_client


# Twilio configuration class (you can adapt this to load from your environment)
class SMSGeneralSetting(EnvFileLoader):
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_PHONE_NUMBER: str


sms_general_setting = SMSGeneralSetting()

# Loading the LLM model
aiClient = get_openai_client()


def generate_sms_content(task, db=None, **kwargs):
    # Dynamically build the context string based on the provided kwargs
    event_details = ", ".join([f"{key}: '{value}'" for key, value in kwargs.items()])

    # Construct the event notification message
    context = (
        f"User {task.user.username} has triggered the event '{task.trigger}'"
        f"{' with details: ' + event_details if event_details else '.'}"
    )

    # Updated prompt to clearly indicate short SMS format
    prompt = (
        f"Compose a brief SMS to notify the user that an event has occurred. Explicitly mention to whom the SMS is addressed and who the sender is. Try to understand from what service does the event comfe from, we have google and github at the moment and addapt the response to it\n\n"
        f"No calls to action are needed, just notify the user about the event details. The message sender name is Area-Team\n\n"
        f"Do not start by telling you have triggered x event, since the event can be trigger by more people he only has a listener pointing to that event\n\n"
        f"Format the message so it's complince with message (SMS) applications so the new lines and point lists, so the user has a good visualization\n\n"
        f"Event Details:\n{context}\n\SMS:\n\nDear {task.user.first_name},"
    )

    # Encode the prompt
    completion = aiClient.chat.completions.create(
        model="gpt-3.5-turbo", messages=[{"role": "system", "content": prompt}]
    )

    email_content = completion.choices[0].message.content
    return email_content


def format_spanish_phone_number(phone_number: str) -> str:
    # Strip any spaces or unwanted characters (just keep digits)
    cleaned_phone_number = "".join(filter(str.isdigit, phone_number))

    # Check if the number is 9 digits long
    if len(cleaned_phone_number) != 9:
        raise ValueError("Invalid Spanish phone number. It must contain exactly 9 digits.")

    # Add the Spanish country code prefix +34
    return f"+34{cleaned_phone_number}"


def send_sms_via_twilio(recipient_phone, sms_content):
    # Format the phone number to include the Spanish country code
    try:
        formatted_phone = format_spanish_phone_number(recipient_phone)
    except ValueError as e:
        print(f"Error formatting phone number: {e}")
        return

    client = Client(sms_general_setting.TWILIO_ACCOUNT_SID, sms_general_setting.TWILIO_AUTH_TOKEN)

    try:
        message = client.messages.create(
            body=sms_content,
            from_=sms_general_setting.TWILIO_PHONE_NUMBER,
            to=formatted_phone,  # Use the formatted number
        )
        print(f"SMS successfully sent to {formatted_phone}, Message SID: {message.sid}")
    except Exception as e:
        print(f"Failed to send SMS: {e}")


def send_sms(service_from=None, task=None, db=None, **kwargs):
    sms_content = generate_sms_content(task, db, **kwargs)
    # phone number on the user object right...??
    recipient_phone = task.user.phone_number  # Ensure this field exists in the task user object
    if recipient_phone is None:
        raise ValueError("Recipient phone number is None.")
    send_sms_via_twilio(recipient_phone, sms_content)
    print(f"SMS sent to {recipient_phone} with content:\n{sms_content}")
    return f"SMS sent to {recipient_phone}"
