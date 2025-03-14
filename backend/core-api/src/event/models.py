from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import func

from src.database import Base


class LastEvent(Base):
    __tablename__ = "last_event"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trigger = Column(String, index=True)
    action_name = Column(String, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
