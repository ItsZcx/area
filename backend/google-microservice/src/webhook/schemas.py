from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel


class Header(BaseModel):
    name: str
    value: str


class Body(BaseModel):
    size: int
    data: Optional[str] = None  # Base64-encoded string


class Part(BaseModel):
    partId: Optional[str] = None
    mimeType: Optional[str] = None
    filename: Optional[str] = None
    headers: Optional[List[Header]] = None
    body: Optional[Body] = None
    parts: Optional[List["Part"]] = None  # Forward reference for recursive structures

    # This is required for Pydantic to resolve forward references
    class Config:
        arbitrary_types_allowed = True


class Payload(BaseModel):
    partId: Optional[str] = None
    mimeType: Optional[str] = None
    filename: Optional[str] = None
    headers: Optional[List[Header]] = None
    body: Optional[Body] = None
    parts: Optional[List[Part]] = None


class Message(BaseModel):
    id: str
    threadId: Optional[str] = None
    labelIds: Optional[List[str]] = None
    snippet: Optional[str] = None
    payload: Optional[Payload] = None
    sizeEstimate: Optional[int] = None
    historyId: Optional[str] = None
    internalDate: Optional[str] = None


# Event Payload


class EmailReceivedEvent(BaseModel):
    event_type: str
    subject: str
    message: str
    to: str
    from_: str


class EventPayload(BaseModel):
    event_name: str
    service: str
    params: Dict[str, str]
    context_params: Dict[str, str]
    processed_message_info: Dict[str, str] = None
