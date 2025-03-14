from datetime import datetime
from typing import Dict

from pydantic import BaseModel
from pydantic import Field


class EventPayload(BaseModel):
    event_name: str
    service: str
    params: Dict[str, str]
    context_params: Dict[str, str]
    processed_message_info: Dict[str, str] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "event_name": "push_event",
                "service": "github",
                "params": {"repo": "my-repo", "branch": "main"},
                "context_params": {"commit_msg": "Initial commit", "author": "pau"},
                "processed_message_info": {"message_id": "1234", "user_id": "1"},
            }
        }


class LastEvent(BaseModel):
    id: int
    trigger: str
    action_name: str
    timestamp: datetime


# supose is like this.. (but this should be somehow dynamic -> jsut need task have same params that event)
class GithubEventArgs(BaseModel):
    owner: str = Field(
        ...,
        description="Repository Owner",
        placeholder="Enter the owner's username (e.g., 'octocat')",
        input_type="text",
    )
    repo: str = Field(
        ...,
        description="Repository Name",
        placeholder="Enter the repository name (e.g., 'hello-world')",
        input_type="text",
    )
    branch: str = Field(
        ..., description="Branch Name", placeholder="Enter the branch name (e.g., 'main')", input_type="text"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "owner": "pau",
                "repo": "Area",
                "branch": "main",
            }
        }


# Suggestion have some templates... for creatin tasks we can have standarst but hte condition is that the
# call to /events  -> should have the same params as the task should just fill the values that the taks had with some
# OTHER REMOVE THE TRIGGER ARGS FROM TEH TAKS... (not that not possible..)


class EmailToPerson(BaseModel):
    to_email: str = Field(
        ..., description="Recipient Email Address", placeholder="Enter recipient's email address", input_type="email"
    )


class EmailFromPerson(BaseModel):
    from_email: str = Field(
        ..., description="Sender Email Address", placeholder="Enter sender's email address", input_type="email"
    )


class RecipientAddress(BaseModel):
    to_address: str = Field(
        ..., description="Recipient Address", placeholder="Enter recipient address", input_type="text"
    )
