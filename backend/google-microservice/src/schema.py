# Pydantic general models

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel
from pydantic import Field


class TaskCreateRequest(BaseModel):
    trigger: str
    trigger_args: Optional[List[str]]
    action_name: str
    action_params: Optional[List[str]]
    user_id: int
    params: Dict[str, Optional[str]]


class Reaction(BaseModel):
    name: str
    service: str


class CreateUserRequest(BaseModel):
    username: str
    password: str
    phone_number: Optional[str]
    email: str
    first_name: str
    last_name: str
    role: str = Field(default="user")
