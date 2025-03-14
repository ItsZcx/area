from src.database import db_dependency
from src.event.schemas import EventPayload
from src.task.models import ProcessedMessage


def message_checker(db: db_dependency, event_payload: EventPayload) -> bool:
    # Ensure processed_message_info exists and contains a message_id
    if not event_payload.processed_message_info or not event_payload.processed_message_info.get("message_id"):
        return False  # No message to check, return False (safe default)

    # Correctly get user_id from processed_message_info
    user_id = event_payload.processed_message_info.get("user_id")
    if user_id is not None:
        user_id = int(user_id)
    else:
        return False  # Cannot proceed without user_id

    # Check if the message_id already exists for the user in the ProcessedMessage table
    if (
        db.query(ProcessedMessage)
        .filter(
            ProcessedMessage.message_id == event_payload.processed_message_info.get("message_id"),
            ProcessedMessage.user_id == user_id,
        )
        .first()
    ):
        return True
    return False
