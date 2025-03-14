from typing import Optional

from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import relationship

from src.database import Base


class GitHubToken(Base):
    __tablename__ = "github_token"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hashed_token = Column(String, default="")
    token_type = Column(String, default="")
    scope = Column(String, default="")

    token_id = Column(Integer, ForeignKey("token.id", ondelete="CASCADE"))
    token = relationship("Token", back_populates="github_token")


class GoogleToken(Base):
    __tablename__ = "google_token"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    access_token = Column(String, default="")
    refresh_token = Column(String, default="")
    token_type = Column(String, default="")
    scope = Column(String, default="")
    expires_at = Column(Integer)  # Unix timestamp

    token_id = Column(Integer, ForeignKey("token.id", ondelete="CASCADE"))
    token = relationship("Token", back_populates="google_token")


class Token(Base):
    __tablename__ = "token"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))
    user = relationship("User", back_populates="token")
    github_token: Mapped[Optional[GitHubToken]] = relationship(
        "GitHubToken",
        back_populates="token",
        uselist=False,
        cascade="all, delete-orphan",
    )
    google_token: Mapped[Optional[GoogleToken]] = relationship(
        "GoogleToken",
        back_populates="token",
        uselist=False,
        cascade="all, delete-orphan",
    )
