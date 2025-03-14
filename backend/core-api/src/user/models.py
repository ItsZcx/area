from typing import List
from typing import Optional

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import relationship

from src.auth.models import Token
from src.database import Base
from src.task.models import ProcessedMessage
from src.task.models import Task


# Database table model
class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, index=True, unique=True)
    email = Column(String)
    phone_number = Column(String, nullable=True)
    first_name = Column(String)
    last_name = Column(String)
    disabled = Column(Boolean, default=False)
    role = Column(String)
    hashed_password = Column(String)
    tasks: Mapped[List[Task]] = relationship(
        "Task", back_populates="user", lazy="dynamic", cascade="all, delete-orphan"
    )
    token: Mapped[Optional[Token]] = relationship(
        "Token", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    processed_messages: Mapped[List[Optional[ProcessedMessage]]] = relationship(
        "ProcessedMessage",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    gmail_webhook_info: Mapped[Optional["GmailWebHookInfo"]] = relationship(
        "GmailWebHookInfo",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    plan = Column(String, default="free")


class GmailWebHookInfo(Base):
    __tablename__ = "gmail_webhook_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))
    user = relationship("User", back_populates="gmail_webhook_info")

    gmail_history_id = Column(String)
    gmail_expiration_date = Column(String)
    resource_id = Column(String)
