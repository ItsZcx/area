from fastapi import APIRouter
from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
from starlette import status

from src.database import db_dependency
from src.event.models import LastEvent as LastEventModel
from src.event.schemas import EventPayload
from src.event.schemas import LastEvent as LastEventSchema
from src.event.utils import message_checker
from src.task.models import ProcessedMessage as ProcessedMessageModel
from src.task.models import Task
from src.task.schemas import ProcessedMessage as ProcessedMessageSchema
from src.task.service import execute_actions
from src.task.utils import generate_event_hash
from src.user.models import User

router = APIRouter(prefix="/events", tags=["Events"])


"""
EVENT TRIGGER

This endpoint `/event` (POST) is designed to inform the core API when an event has been triggered.
The core API will then execute the actions associated with the event.
The crucial part is that the event.params passed to the event are the same as `task.trigger_args`.
This endpoint will execute any reactions associated with that specific event.

EXAMPLE PAYLOAD:
{
  "event_name": "push_event",
  "params": {
    "branch": "main",
    "repo": "my-repo"
  },
  "service": "github"
}

`event_name` should match the trigger in the task model, and `params` should match the `trigger_args` in the task model.
`service` is included to indicate the source of the event.

"""
special_triggers = ["email_received", "email_sent"]


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=list[LastEventSchema],
    summary="Get all executed events",
    description="Returns a list of all executed events since the APP release, if no events are found, a 404 error is raised",
)
def get_events(db: db_dependency):
    all_events = db.query(LastEventModel).all()

    if not all_events:
        raise HTTPException(status_code=404, detail="No events found")

    return all_events


@router.post(
    "",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=str,
    summary="Handle event",
    description="Handles an event by executing the associated actions",
)
def handle_event(db: db_dependency, event_request: EventPayload):
    # print("MICROSERVICE EVENT RECEIVED ON CORE API")
    # print(
    # "event request", event_request
    # )  # request has args and all of that but only name and args for creagin the hash
    # print("event request", event_request)
    # print("event_params", event_request.params)
    # print("event_context_params", event_request.context_params)
    # generate hash

    if message_checker(db, event_request):
        print("Message has been processed skiping the event...")
        return ""

    special_tasks = None
    if event_request.event_name in special_triggers:
        special_tasks = find_matching_tasks(
            db,
            event_request.event_name,
            event_request.params.get("email"),
            event_request.context_params.get("from"),
            event_request.context_params.get("to"),
        )
    # generate task with that event
    param_values_as_list = [str(value) for value in event_request.params.values()]  # event params as a list
    event_hash = generate_event_hash(event_request.event_name, param_values_as_list)
    merged_params = {**event_request.params, **event_request.context_params}
    action_name = execute_actions(
        db, special_tasks, event_request.event_name, event_request.service, event_hash, **merged_params
    )
    # print("action_name", action_name)
    last_event = LastEventModel(
        trigger=event_request.event_name,
        action_name=action_name,
    )
    db.add(last_event)
    # Create and log the ProcessedMessage to prevent reprocessing
    if event_request.processed_message_info:
        processed_message = ProcessedMessageModel(
            message_id=event_request.processed_message_info.get("message_id"),
            # Add any other fields necessary from ProcessedMessage
            user_id=event_request.processed_message_info.get("user_id"),
        )
        db.add(processed_message)
    # print("last event and processed message added to db")
    db.commit()
    return "" if action_name is None else action_name


def find_matching_tasks(db: Session, event_name: str, user_email: str, from_email: str, to_email: str):
    tasks = (
        db.query(Task)
        .join(User)  # Join Task with User based on the relationship
        .filter(Task.trigger == event_name)  # Filter by event name (trigger)
        .filter(User.email == user_email)  # Filter by user email (params[0])
        .all()
    )

    for task in tasks:
        if len(task.trigger_args) >= 3:
            if task.trigger_args[3] == "only_from":
                if task.trigger_args[2] != from_email:
                    print(f"Task {task.id} does not match the 'from' email")
                    tasks.remove(task)
                else:
                    print("TASK MATCHES 'FROM' EMAIL")
            elif task.trigger_args[3] == "only_to":
                if task.trigger_args[2] != to_email:
                    print(f"Task {task.id} does not match the 'to' email")
                    tasks.remove(task)
                else:
                    print("TASK MATCHES 'TO' EMAIL")
            else:
                print("email_from not in trigger_args")
        else:
            print(f"Task {task.id} has insufficient trigger_args length")

    return tasks


@router.get(
    "/last",
    response_model=LastEventSchema,
    summary="Get last executed event",
    description="Returns the last executed event based on the timestamp, if no event is found, a 404 error is raised",
)
def last_event(db: db_dependency):
    last_events = db.query(LastEventModel).order_by(desc(LastEventModel.timestamp)).first()

    if not last_events:
        raise HTTPException(status_code=404, detail="No event found")

    return last_events


@router.get(
    "/list_messages",
    response_model=list[ProcessedMessageSchema],
    summary="Get all processed messages",
    description="Returns a list of all processed messages, if no messages are found, a 404 error is raised",
)
def list_messages(db: db_dependency):
    all_messeges = db.query(ProcessedMessageModel).all()

    if not all_messeges:
        raise HTTPException(status_code=404, detail="No messages found")

    return all_messeges
