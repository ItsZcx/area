import datetime

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from src.database import Base

# You can query trigger and trigger args but evetn_hash is unique for every trigger and trigger args


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trigger = Column(String, index=True)
    trigger_args = Column(ARRAY(String), nullable=True)
    event_hash = Column(String, index=True, nullable=False)  # Store the hash
    action_name = Column(String, index=True)
    action_params = Column(
        ARRAY(String), nullable=True
    )  # Related with reactions that are not llm based (ex google calendar)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))  # ForeignKey to User model
    user = relationship("User", back_populates="tasks")  # Relationship to User
    requires_oauth = Column(Boolean, default=False)
    oauth_token = Column(String, nullable=True)
    service = Column(String, nullable=False)  # Store the service here


# this is gmail messages that are processed
# ADD USER TO HERE
class ProcessedMessage(Base):
    __tablename__ = "processed_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))
    user = relationship("User", back_populates="processed_messages")  # Relationship to User
    processed_at = Column(DateTime, default=datetime.datetime.utcnow)
