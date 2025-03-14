import re

from dateutil import parser
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from src.auth.config import auth_setting
from src.task.schemas import CalendarReactionsArgs
from src.user.models import User

# # Event details -> needed example for calling this funciton
# event_kwargs = {
#     'summary': 'Team Meeting',
#     'description': 'Discuss project updates',
#     'start_time': '2024-10-10T10:00:00-07:00',
#     'end_time': '2024-10-10T11:00:00-07:00',
#     'time_zone': 'America/Los_Angeles',
#     'attendees': ['attendee1@example.com', 'attendee2@example.com'],
#     'location': 'Conference Room A',
# }


""" Task creation example with google
{
  "action_name": "google_cal_event",
  "params": {
    "oauth_token": "abc123",
    "service": "google"
  },
  "trigger": "push_event",
  "trigger_args": [
    "Team Meeting",
    "Discuss project updates",
    "2024-10-10T10:00:00-07:00",
    "2024-10-10T11:00:00-07:00",
    "America/Los_Angeles",
    "attendee1@example.com, attendee2@example.com",
    "Conference Room A"
  ],
  "user_id": 1
}

/event
{
  "event_name": "push_event",
  "params": {
    "summary": "Team Meeting",
    "description": "Discuss project updates",
    "start_time": "2024-10-10T10:00:00-07:00",
    "end_time": "2024-10-10T11:00:00-07:00",
    "time_zone": "America/Los_Angeles",
    "attendees": ["attendee1@example.com", "attendee2@example.com"],
    "location": "Conference Room A"
  },
  "service": "github"
}


"""

field_names = ["summary", "description", "start_time", "end_time", "time_zone", "attendees", "location"]


def convert_to_rfc3339(date_str):
    try:
        cleaned_date_str = re.sub(r"\s*\(.*\)$", "", date_str)
        dt = parser.parse(cleaned_date_str)
        return dt.isoformat()
    except Exception as e:
        print(f"Error parsing date string '{date_str}': {e}")
        raise


def create_google_cal_event(task, db, **kwargs):
    """
    Creates a Google Calendar event using OAuth 2.0 token.

    Args:
        task: The task object that contains user and event information.
        db_session: The database session for committing token updates.
        **kwargs: Additional event-specific details.

    Returns:
        str: Confirmation message with event details or an error message.
    """
    print("CREATE GOOGLE CAL EVENT HIT...")

    # Extract user's Google token
    # If not gettit from the task user... (bether get the actual one) I guess...
    user = db.query(User).get(task.user_id)
    google_token = user.token.google_token

    if not google_token:
        return "User has not authenticated with Google or token expired."

    print("Refresh token", google_token.refresh_token)
    # Create credentials object
    credentials = Credentials(
        token=google_token.access_token,
        refresh_token=google_token.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=auth_setting.GOOGLE_CLIENT_ID,
        client_secret=auth_setting.GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/calendar.events"],
    )

    # Refresh the token if expired
    if credentials.expired and credentials.refresh_token:
        try:
            credentials.refresh(Request())
            # Update the stored tokens
            google_token.access_token = credentials.token
            google_token.expires_at = int(credentials.expiry.timestamp())
            db.add(google_token)
            db.commit()
        except Exception as e:
            return f"Failed to refresh Google token: {str(e)}"

    # action arguments -> test if all okay.. as it should ve fore the types

    # knargs -> get that from the task
    #     summary: str
    # description: str
    # start_time: str
    # end_time: str
    # time_zone: str
    # attendees: str
    # location: str

    print("TASK ON GOOGLE CALENDAR", task)
    # Create a dictionary by zipping field names and array elements
    params_dict = dict(zip(field_names, task.action_params))

    # Create an instance of CalendarReactionsArgs using the dictionary
    action_params = CalendarReactionsArgs(**params_dict)
    print("ACTION PARAMS on google calendar as dict", action_params)

    # need to be in order
    attendees_str = action_params.attendees
    # If the attendees are passed as a string, split them by commas and trim spaces
    attendees_list = [email.strip() for email in attendees_str.split(",") if email.strip()]

    start_date_time = convert_to_rfc3339(action_params.start_time)
    end_date_time = convert_to_rfc3339(action_params.end_time)

    event_details = {
        "summary": action_params.summary,
        "description": action_params.description,
        "start": {
            "dateTime": start_date_time
            # "timeZone": action_params.time_zone if action_params.time_zone else "UTC",
        },
        "end": {
            "dateTime": end_date_time
            # "timeZone": action_params.time_zone if action_params.time_zone else "UTC",
        },
        "attendees": [{"email": email} for email in attendees_list],
        "location": action_params.location,
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 24 * 60},
                {"method": "popup", "minutes": 10},
            ],
        },
    }

    print("EVENT DETAILS", event_details)
    print("EVENT BUILDED")
    # Build the service
    service = build("calendar", "v3", credentials=credentials)

    try:
        # Build the service
        service = build("calendar", "v3", credentials=credentials)
        # Insert the event
        event_result = service.events().insert(calendarId="primary", body=event_details).execute()

        # Log and return event creation success
        print(f"Google Calendar event created: {event_result.get('htmlLink')}")
        return f"Google Calendar event created: {event_result.get('htmlLink')}"
    except Exception as e:
        # Log and raise the error
        print(f"EVENT FAILED: {str(e)}")
        raise Exception(f"Failed to create Google Calendar event: {str(e)}")
