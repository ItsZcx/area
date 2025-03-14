import asyncio
import contextlib
import inspect
from contextlib import asynccontextmanager
from enum import Enum
from typing import TypedDict, List

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from src.schema import CreateUserRequest, Reaction, TaskCreateRequest
from src.triggers.service import (
    repository_CI_CD_pipeline_create_webhook,
    repository_pull_request_create_webhook,
    repository_push_create_webhook,
)
from src.webhook.router import router as webhook_router

# Define Task and TriggerEnum
class Task(TypedDict):
    trigger: str
    trigger_args: List[str]
    action_name: str
    user_id: int
    requires_oauth: bool
    oauth_token: str


class TriggerEnum(Enum):
    PUSH = "push_event"
    PULL = "pull_request_to_main"
    CI_CD_PIPELINE = "ci_cd_pipeline"


trigger_to_function = {
    TriggerEnum.PUSH: repository_push_create_webhook,
    TriggerEnum.PULL: repository_pull_request_create_webhook,
    TriggerEnum.CI_CD_PIPELINE: repository_CI_CD_pipeline_create_webhook,
}

core_api = "http://area-core-api:8080/api/v1"


async def main_loop():
    while True:
        print("Running main loop...")
        await asyncio.sleep(5)
        print("Sleeping for 5 seconds...")
        tasks = None

        # Retry logic for core_api getter
        while tasks is None:
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.get(f"{core_api}/tasks?service=github")
                    if response.status_code != 200:
                        print(f"Failed to fetch tasks: {response.status_code}")
                        print(f"Response: {response.text}")
                        # Wait before retrying
                        await asyncio.sleep(5)
                        continue

                    tasks = response.json()
                    print(f"Received tasks: {tasks}")

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
                trigger = task["trigger"]
                trigger_enum = TriggerEnum(trigger)
                if trigger_enum in trigger_to_function:
                    handler_function = trigger_to_function[trigger_enum]
                    print(f"Handling {trigger} event for user {task['user_id']}")
                    if inspect.iscoroutinefunction(handler_function):
                        await handler_function(task["trigger_args"], task["oauth_token"])
                    else:
                        handler_function(task["trigger_args"], task["oauth_token"])
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


app = FastAPI(title="Github-Microservice", lifespan=lifespan)
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
