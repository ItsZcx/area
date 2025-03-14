import datetime
from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import Field

from src.user.schemas import User


class Task(BaseModel):
    id: int
    trigger: str
    action_name: str
    user_id: int
    user: User


class TaskCreateRequest(BaseModel):
    trigger: str
    trigger_args: Optional[List[str]]
    action_name: str
    action_params: Optional[List[str]]
    user_id: int
    params: Dict[str, Optional[str]]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "trigger": "push_event",
                "trigger_args": ["repo", "branch"],
                "action_name": "deploy_application",
                "user_id": 1,
                "params": {"service": "github", "oauth_token": "abc123", "x": "y"},
            }
        }


# --------------- PATCH and PUT schemas ------------------ #


class TaskUpdateRequest(BaseModel):
    trigger: str
    trigger_args: Optional[List[str]]
    action_name: str
    action_params: Optional[List[str]]
    user_id: int
    service: str
    oauth_token: Optional[str]
    requires_oauth: bool

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "trigger": "push_event",
                "trigger_args": ["xRozzo", "TweetMoji", "refs/heads/main"],
                "action_name": "create_google_cal_event",
                "action_params": [
                    "Team Meeting",
                    "Discuss project updates",
                    "2024-10-28T11:00:00-07:00",
                    "2024-10-28T12:00:00-07:00",
                    "America/Los_Angeles",
                    "attendee1@example.com, attendee2@example.com",
                    "Conference Room A",
                ],
                "user_id": 1,
                "service": "github",
                "oauth_token": "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",
                "requires_oauth": True,
            }
        }


class TaskPartialUpdateRequest(BaseModel):
    trigger: Optional[str] = None
    trigger_args: Optional[List[str]] = None
    action_name: Optional[str] = None
    action_params: Optional[List[str]] = None
    user_id: Optional[int] = None
    service: Optional[str] = None
    oauth_token: Optional[str] = None
    requires_oauth: Optional[bool] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "action_params": [
                    "Client Meeting",
                    "Discuss project requirements",
                    "2024-11-10T14:00:00-07:00",
                    "2024-11-10T15:00:00-07:00",
                    "America/Los_Angeles",
                    "client@example.com",
                    "Conference Room C",
                ],
                "oauth_token": "new_oauth_token_value",
            }
        }


# ------------------------------------------ #


# ARGUMENTS ON REACTIONS
class CalendarReactionsArgs(BaseModel):
    summary: str
    description: str
    start_time: str
    end_time: str
    time_zone: str
    attendees: str
    location: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "summary": "Team Meeting",
                "description": "Discuss project updates",
                "start_time": "2024-10-10T10:00:00-07:00",
                "end_time": "2024-10-10T11:00:00-07:00",
                "time_zone": "America/Los_Angeles",
                "attendees": "attendee1@example.com, attendee2@example.com",
                "location": "Conference Room A",
            }
        }


class CalendarCalendarReactionsArgsFronted(BaseModel):
    summary: str = Field(..., description="Event Summary", placeholder="Enter event summary", input_type="text")
    description: str = Field(
        ..., description="Event Description", placeholder="Describe the event", input_type="textarea"
    )
    start_time: str = Field(..., description="Start Time of the event", input_type="date")
    end_time: str = Field(..., description="End Time of the event", input_type="date")
    time_zone: str = Field(..., description="Time Zone", placeholder="Enter time zone", input_type="text")
    attendees: List[EmailStr] = Field(
        ...,
        description="List of Attendees Emails",
        placeholder="Enter attendees' emails separated by commas",
        example="attendee@gmail.com, attendee2@gmail.com",
    )
    location: str = Field(..., description="Event Location", placeholder="Event location", input_type="text")


class SendPrivateMessageArgs(BaseModel):
    username: str
    subject: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "summary": "Team Meeting",
                "description": "Discuss project updates",
                "start_time": "2024-10-10T10:00:00-07:00",
                "end_time": "2024-10-10T11:00:00-07:00",
                "time_zone": "America/Los_Angeles",
                "attendees": "attendee1@example.com, attendee2@example.com",
                "location": "Conference Room A",
                "username": "EpiAreaBot",
                "subject": "Hello, im testing the private messege reaction",
            }
        }


class PostNewSubmissionArgs(BaseModel):
    title: str
    subreddit: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "Reddit post title",
                "subreddit": "EpiAreaBot",
            }
        }


class PostNewCommentOnPostArgs(BaseModel):
    post_id: str
    subject: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "post_id": "1ge40gv",
                "subject": "Hello, im testing the comment on post reaction",
            }
        }


class ProcessedMessage(BaseModel):
    id: int
    message_id: str
    user_id: int
    user: User
    processed_at: datetime.datetime

    class Config:
        from_attributes = True
