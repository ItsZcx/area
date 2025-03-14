import asyncio
import contextlib
import inspect
from contextlib import asynccontextmanager
from enum import Enum
from typing import List
from typing import TypedDict

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.schema import CreateUserRequest
from src.schema import TaskCreateRequest
from src.triggers.service import any_email_received_webhook
from src.triggers.service import email_received_from_person_webhook
from src.triggers.service import email_sent_webhook
from src.webhook.router import router as webhook_router


class Task(TypedDict):
    trigger: str
    trigger_args: List[str]
    action_name: str
    action_params: List[str]
    user_id: int
    requires_oauth: bool
    oauth_token: str


class TriggerEnum(Enum):
    EMAIL_RECEIVED = "email_received"
    PERSON_EMAIL_RECEIVED = "email_received_from_person"
    EMAIL_SENT = "email_sent"


trigger_to_function = {
    TriggerEnum.EMAIL_RECEIVED: any_email_received_webhook,
    TriggerEnum.PERSON_EMAIL_RECEIVED: email_received_from_person_webhook,
    TriggerEnum.EMAIL_SENT: email_sent_webhook,
}

core_api = "http://area-core-api:8080/api/v1"


async def main_loop():
    print("MAIN LOOP GOOGLE HIT")
    while True:
        print("Sleeping for 5 seconds...")
        await asyncio.sleep(5)
        print("Running main loop...")
        tasks = None

        # Retry logic for core_api getter
        while tasks is None:
            async with httpx.AsyncClient() as client:
                try:
                    """
                    # Get Reactions List
                    reactions_list_response = await client.get(f"{core_api}/tasks/reactions")
                    if reactions_list_response.status_code != 200:
                        print(f"Failed to get reactions: {reactions_list_response.status_code}")
                        print(f"Response: {reactions_list_response.text}")
                        return
                    reactions_data = reactions_list_response.json()
                    if not reactions_data:
                        print("No reactions available.")
                        return
                    # Assuming reactions_data is a list of dictionaries
                    first_reaction_name = reactions_data[0].get('name')
                    print(f"First reaction name: {first_reaction_name}")
                    if not first_reaction_name:
                        print("First reaction does not have a 'name' field.")
                        return
                    # Create Task
                    task_create_request = TaskCreateRequest(
                        trigger="any_email_received",
                        trigger_args=["area-epitech-437409", "Area-Epitech"],
                        action_name=first_reaction_name,
                        action_params=[],
                        user_id=1,
                        params={"service": "google", "oauth_token": "True"}
                    )
                    create_task_response = await client.post(
                        f"{core_api}/tasks",
                        json=task_create_request.dict()
                    )
                    if create_task_response.status_code != 201:
                        print(f"Failed to create task: {create_task_response.status_code}")
                        print(f"Response: {create_task_response.text}")
                        return
                    print("Task created")
                    """

                    print("Fetching tasks google...")
                    response = await client.get(f"{core_api}/tasks?service=google")

                    if response.status_code != 200:
                        print(f"Failed to fetch tasks: {response.status_code}")
                        print(f"Response: {response.text}")
                        # Wait before retrying
                        await asyncio.sleep(5)
                        continue

                    print(f"fetching tasks...")
                    tasks = response.json()
                    print(f"Received tasks on google: {tasks}")

                except httpx.RequestError as e:
                    print(f"An error occurred while requesting: {e}")
                    # Wait before retrying
                    await asyncio.sleep(5)
                    continue
                except Exception as e:
                    print(f"An unexpected error occurred: {e}")
                    # Wait before retrying
                    await asyncio.sleep(5)
                    continue

            # Process the tasks
            for task in tasks:
                print(f"CURRENT Task: {task}")
                trigger = task["trigger"]
                trigger_enum = TriggerEnum(trigger)
                if trigger_enum in trigger_to_function:
                    handler_function = trigger_to_function[trigger_enum]
                    print(f"Handling {trigger} event for user {task['user_id']} with args {task['trigger_args']}")
                    if inspect.iscoroutinefunction(handler_function):
                        print("function found", handler_function)
                        await handler_function(task["trigger_args"], task["oauth_token"], task["user_id"])
                    else:
                        print("function not found")
                        await handler_function(task["trigger_args"], task["oauth_token"], task["user_id"])
                else:
                    print(f"Unknown trigger: {trigger} for user {task['user_id']}")

            # Wait before the next iteration
            await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(main_loop())
    try:
        yield
    finally:
        # Shutdown, cancel main loop
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


app = FastAPI(title="Google-Microservice", lifespan=lifespan)
app.include_router(webhook_router, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"msg": "Server is running"}
