from typing import Optional

from pydantic import BaseModel
from pydantic import Field

from src.auth.schemas import TokenInDB


class CreateUserRequest(BaseModel):
    username: str
    password: str
    phone_number: Optional[str] = Field(default=None)
    email: str
    first_name: str
    last_name: str
    role: str = Field(default="user")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "username": "pau",
                "password": "1234",
                "phone_number": "123456789",
                "email": "pau@gmail.com",
                "first_name": "Pau",
                "last_name": "Mérida Ruiz",
                "role": "user",
            }
        }


class User(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    disabled: bool = Field(default=False)
    role: str
    plan: Optional[str] = Field(default="free")
    phone_number: Optional[str] = Field(default=None)
    gmail_history_id: Optional[int] = Field(default=None)


class UserInDB(User):
    hashed_password: str
    token: TokenInDB


class UpdateUserHistory(BaseModel):
    user_id: int
    resource_id: str
    gmail_history_id: int
    gmail_expiration_date: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "resource_id": "123456",
                "gmail_history_id": 123456,
                "gmail_expiration_date": "2024-10-22T14:30:36.270296",
            }
        }


class GoogleTokenSchema(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    scope: Optional[str] = None
    token_type: Optional[str] = None
    id_token: Optional[str] = None

    class Config:
        from_attributes = True


class GmailWebHookInfoSchema(BaseModel):
    gmail_history_id: str
    gmail_expiration_date: str  # Use datetime if appropriate
    resource_id: str

    class Config:
        from_attributes = True


class TokenSchema(BaseModel):
    google_token: Optional[GoogleTokenSchema]

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    token: Optional[TokenSchema]
    gmail_webhook_info: Optional[GmailWebHookInfoSchema]

    class Config:
        from_attributes = True
