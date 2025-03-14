from typing import Optional

from pydantic import BaseModel
from pydantic import Field


class BasicToken(BaseModel):
    access_token: str
    token_type: str


class GitHubToken(BaseModel):
    access_token: str = Field(default="")
    token_type: str = Field(default="")
    scope: str = Field(default="")

    class Config:
        from_attributes = True


class GoogleToken(BaseModel):
    access_token: str = Field(default="")
    refresh_token: str = Field(default="")
    token_type: str = Field(default="")
    scope: str = Field(default="")
    expires_at: Optional[int] = Field(default=None)

    class Config:
        from_attributes = True


class Token(BaseModel):
    user_id: int  # Probably used for relations
    github_token: GitHubToken
    google_token: GoogleToken

    class Config:
        from_attributes = True


class GitHubTokenInDB(BaseModel):
    id: int
    hashed_token: str = Field(default="")
    token_type: str = Field(default="")
    scope: str = Field(default="")

    class Config:
        from_attributes = True


class GoogleTokenInDB(BaseModel):
    id: int
    access_token: str = Field(default="")
    refresh_token: str = Field(default="")
    token_type: str = Field(default="")
    scope: str = Field(default="")
    expires_at: Optional[int] = Field(default=None)

    class Config:
        from_attributes = True


class TokenInDB(BaseModel):
    id: int
    user_id: int
    github_token: GitHubTokenInDB
    google_token: GoogleTokenInDB

    class Config:
        from_attributes = True
