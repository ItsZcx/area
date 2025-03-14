import time  # Add this import

import requests
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import joinedload
from starlette import status

from src.auth.models import GoogleToken
from src.auth.models import Token
from src.database import db_dependency
from src.task.config import task_setting
from src.task.models import Task
from src.task.schemas import TaskCreateRequest
from src.task.schemas import TaskPartialUpdateRequest
from src.task.schemas import TaskUpdateRequest
from src.task.utils import action_registry
from src.task.utils import action_to_params
from src.task.utils import event_registry
from src.task.utils import generate_event_hash
from src.task.utils import is_valid_action
from src.user.models import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


"""
This endpoint `/tasks` (GET) is designed to return all tasks associated with a specific service.

IMPORTANT: If not task asociated with the service, the response will be an empty list.
"""


def refresh_google_token(google_token: GoogleToken) -> GoogleToken:
    token_url = "https://oauth2.googleapis.com/token"

    data = {
        "client_id": task_setting.GOOGLE_CLIENT_ID,
        "client_secret": task_setting.GOOGLE_CLIENT_SECRET,
        "refresh_token": google_token.refresh_token,
        "grant_type": "refresh_token",
    }

    response = requests.post(token_url, data=data)

    if response.status_code == 200:
        token_data = response.json()

        # Update the google_token object
        google_token.access_token = token_data["access_token"]
        google_token.expires_at = int(token_data.get("expires_in", 3600)) + int(time.time())
        google_token.scope = token_data.get("scope", google_token.scope)
        google_token.token_type = token_data.get("token_type", google_token.token_type)

        return google_token
    else:
        raise HTTPException(status_code=400, detail="Failed to refresh Google token.")


@router.get("", status_code=status.HTTP_200_OK)
def get_tasks(db: db_dependency, service: str):
    tasks = (
        db.query(Task)
        .options(
            joinedload(Task.user).joinedload(User.token).joinedload(Token.google_token),
            joinedload(Task.user).joinedload(User.token).joinedload(Token.github_token),
        )
        .filter(Task.service == service)
        .all()
    )

    response = []
    for task in tasks:
        task_data = {
            "trigger": task.trigger,
            "trigger_args": task.trigger_args,
            "action_name": task.action_name,
            "user_id": task.user_id,
            "requires_oauth": task.requires_oauth,
        }

        if task.requires_oauth:
            user_token = task.user.token  # User's Token

            if service == "google":
                if user_token and user_token.google_token:
                    try:
                        print("Refreshing Google token...")
                        refresh_google_token(user_token.google_token)
                        print("Google token refreshed successfully.")

                        # Update task's oauth_token
                        task.oauth_token = user_token.google_token.access_token

                        # Commit the session to save changes
                        db.commit()

                        # Include oauth_token in response
                        task_data["oauth_token"] = task.oauth_token
                    except HTTPException as e:
                        task_data["error"] = e.detail
                else:
                    task_data["error"] = "User does not have a Google token."

            elif service == "github":
                if user_token and user_token.github_token:
                    # GitHub tokens typically do not expire; include it directly
                    task.oauth_token = user_token.github_token.hashed_token

                    # Commit if task.oauth_token was updated
                    db.commit()

                    task_data["oauth_token"] = task.oauth_token
                else:
                    task_data["error"] = "User does not have a GitHub token."

            else:
                task_data["error"] = f"Service '{service}' is not supported."

        response.append(task_data)

    return response


# EXTRA GETTERS:


# get all the services available (done)
@router.get("/services", status_code=status.HTTP_200_OK)
def get_services():
    services = []
    for service in action_registry.keys():
        services.append(service)
    for service in event_registry.keys():
        if service not in services:
            services.append(service)
    return services


# get the services that have reactions (done)
@router.get("/services/reactions", status_code=status.HTTP_200_OK)
def get_services_with_actions():
    services = []
    for service, actions in action_registry.items():
        if actions:
            services.append(service)
    return services


# get the services that have events (done)
@router.get("/services/events", status_code=status.HTTP_200_OK)
def get_services_with_events():
    services = []
    for service, events in event_registry.items():
        if events:
            services.append(service)
    return services


# get all the actions for a services (done)
@router.get("/reactions/{service}", status_code=status.HTTP_200_OK)
def get_actions(service: str):
    actions = []

    if service not in action_registry:
        raise HTTPException(status_code=404, detail="Service not found")

    for action, func in action_registry[service].items():
        actions.append(action)

    return actions


@router.get("/events/{service}", status_code=status.HTTP_200_OK)
def get_events(service: str):
    # make a list of events available
    events = []
    if service not in event_registry:
        raise HTTPException(status_code=404, detail="Service not found")

    for event, registry in event_registry[service].items():
        events.append(event)

    return events


@router.get("/params/event/{event}", status_code=status.HTTP_200_OK)
def get_trigger_params(event: str):
    for service, event_dict in event_registry.items():
        if event in event_dict:
            event_args = event_dict[event]

            # Check if the event args is None
            if event_args is None:
                return []

            # Extract field details and return structured metadata
            field_details = []
            for field_name, field_info in event_args.model_fields.items():
                # Access extra metadata from field_info.json_schema_extra
                extra_info = field_info.json_schema_extra or {}

                field_data = {
                    "id": field_name,
                    "type": extra_info.get("input_type", "text"),
                    "label": field_info.description or field_name.replace("_", " ").capitalize(),
                    "placeholder": extra_info.get("placeholder", ""),
                }
                field_details.append(field_data)

            print("field_details", field_details)
            return field_details

    # If event not found at all
    raise HTTPException(status_code=404, detail="Event not found")


# reaction_params neede for the (reactions) -> **action_params** (none if not needed)
# action_to_params = {
#     "send_email": None,
#     "send_sms": None,
#     "create_google_cal_event": CalendarReactionsArgs,
# }


@router.get("/params/reaction/{reaction}", status_code=status.HTTP_200_OK)
def get_reaction_params(reaction: str):
    if reaction not in action_to_params:
        raise HTTPException(status_code=404, detail="Reaction not found")

    params_model = action_to_params[reaction]
    if params_model is None:
        return []

    # Extract field details and return structured metadata
    field_details = []
    for field_name, field_info in params_model.model_fields.items():
        # Access extra metadata from field_info.json_schema_extra
        extra_info = field_info.json_schema_extra or {}

        field_data = {
            "id": field_name,
            "type": extra_info.get("input_type", "text"),  # default to "text" if not provided
            "label": field_info.description or field_name.replace("_", " ").capitalize(),
            "placeholder": extra_info.get("placeholder", ""),
        }
        field_details.append(field_data)

    return field_details


@router.get("/reactions", status_code=status.HTTP_200_OK)
def get_reactions():
    actions = []

    for service, action_dict in action_registry.items():
        for action, func in action_dict.items():
            actions.append({"name": action, "service": service})

    return actions


"""
TASK CREATION:
A task is created when users choose an action and a reaction (trigger and reaction). 
This will be assigned on the front end and call this `/task` (POST) to create it.

Payload args (TaskCreateRequest):

Trigger -> event that will trigger the action
Action -> action that will be executed; you can use the `/task/reactions` endpoint 
          to get the list of actions and the services that are linked to it 
          (or "common" if it's a common reaction).
user_id -> the user who created the task (retrieved from the auth session). IMPORTANT: user must exit in the db.
params -> Important: `trigger_args` must be the same as in `EventPayload.params` class `EventPayload(BaseModel)` 
          (see it in `event/schemas.py`).

- This is crucial since the `event_hash` is generated from the trigger, `trigger_args` for the task, 
  `event_name`, and `params` for the event.
- Additionally, `params` refers to extra parameters linked to the task but not to the event 
  (e.g., the service and the `oauth_token`). This allows the microservice to know which auth token 
  to use, and when tasks are executed, we can know which service is being used.

SEE AN EXAMPLE OF A TASK CREATION (see the example of /event for this task in /event/router.py):
{
  "action_name": "deploy_application",
  "params": {
    "oauth_token": "abc123",
    "service": "github",
    "x": "y"
  },
  "trigger": "push_event",
  "trigger_args": [
    "repo",
    "branch"
  ],
  "user_id": 1
}

For tasks with the reaction `google_cal_event`, you will need to follow a schema for the `trigger_args` 
and `event.params` since the `params` need to be specific:
Find the schema in `event/schemas.py` -> `CalendarEventArgs(BaseModel)`.

Also, for GitHub-related actions/events, I suggest following this schema -> `GithubEventArgs(BaseModel)`. 
Although it is not completely necessary since we use ML (llm/llm.py) to generate a response for either the `send_email` 
or `send_sms` actions, it's good to have a standard.
"""


# create the task /task
@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(db: db_dependency, task_request: TaskCreateRequest):
    # if trigger or action_name
    if not is_valid_action(task_request.action_name):
        raise HTTPException(status_code=400, detail="Invalid trigger or action name")

    service = task_request.params.get("service")
    oauth_token = task_request.params.get("oauth_token")  # can be none if not needed

    if not service:
        raise HTTPException(status_code=400, detail="Service is required in the params")

    requires_oauth = bool(oauth_token)

    # Each task with the auth alos or with user id and then...
    # If we add task the service and the credetntials will

    print("task_request", task_request)

    user = db.query(User).filter(User.id == task_request.user_id).first()

    # for reieved task will be only the email + the trigger -> so if trigger is received email only email, if is sent email also the trigggers (args need to add this in front)
    print(f"generating hash for user {user.email} and trigger {task_request.trigger}")
    hash = generate_event_hash(task_request.trigger, task_request.trigger_args)

    print("Action params on task creation", task_request.action_params)

    if task_request.trigger in special_triggers:
        print(f"Task is a special one {task_request.trigger}, changing trigger and args")
        if task_request.trigger == "email_received_from_person":
            # append a new args to the trigger_args
            task_request.trigger_args.append("only_from")  # check if is only from -> check with the trigger args - 1
            task_request.trigger = "email_received"
        elif task_request.trigger == "email_sent_to_person":
            # append a new args to the trigger_args
            task_request.trigger_args.append("only_to")
            task_request.trigger = "email_sent"
        else:
            print(f"Tas k is not a special one {task_request.trigger}")

    create_task_model = Task(
        trigger=task_request.trigger,
        trigger_args=task_request.trigger_args,
        action_name=task_request.action_name,
        action_params=task_request.action_params,
        user_id=task_request.user_id,
        requires_oauth=requires_oauth,
        oauth_token=oauth_token,
        service=service,
        event_hash=hash,
    )

    db.add(create_task_model)
    db.commit()

    return {"message": "Task created successfully"}


# task getter by user id (all the task of the users)
@router.get("/user/{user_id}", status_code=status.HTTP_200_OK)
def get_tasks(db: db_dependency, user_id: str):
    # Filter tasks by service
    tasks = db.query(Task).filter(Task.user_id == user_id).all()

    response = []
    for task in tasks:
        response.append(task)  # The user will

    return response

# get task by task id
@router.get("/{task_id}", status_code=status.HTTP_200_OK)
def get_task(db: db_dependency, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(db: db_dependency, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}


special_triggers = [
    "email_sent",
    "email_received",
    "email_received_from_person",
    "calendar_event_created",
    "email_sent_to_person",
]


# PUT and PATCH


@router.put("/tasks/{task_id}", status_code=status.HTTP_200_OK)
def update_task(task_id: int, task_request: TaskUpdateRequest, db: db_dependency):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update all fields
    task.trigger = task_request.trigger
    task.trigger_args = task_request.trigger_args
    task.action_name = task_request.action_name
    task.action_params = task_request.action_params
    task.user_id = task_request.user_id
    task.service = task_request.service
    task.oauth_token = task_request.oauth_token
    task.requires_oauth = task_request.requires_oauth

    # Recompute event_hash
    task.event_hash = generate_event_hash(task.trigger, task.trigger_args)

    db.commit()
    db.refresh(task)

    return task


@router.patch("/tasks/{task_id}", status_code=status.HTTP_200_OK)
def partial_update_task(task_id: int, task_request: TaskPartialUpdateRequest, db: db_dependency):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update only the fields provided in the request
    update_data = task_request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # Recompute event_hash if necessary
    task.event_hash = generate_event_hash(task.trigger, task.trigger_args)

    db.commit()
    db.refresh(task)

    return task
