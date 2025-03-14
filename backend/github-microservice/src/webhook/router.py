# Router with the endpoints
import hashlib
import hmac

import requests
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from pydantic import ValidationError

from src.config import src_setting
from src.webhook.schemas import EventPayload
from src.webhook.schemas import PullRequestEvent
from src.webhook.schemas import PushEvent
from src.webhook.schemas import WorkflowRunEvent

router = APIRouter(prefix="/webhook", tags=["Webhook"])

@router.post("")
async def webhook_listener(request: Request):

    body = await request.body()

    signature = request.headers.get("X-Hub-Signature-256")
    event_type = request.headers.get("X-GitHub-Event")

    if not is_valid_signature(body, signature, src_setting.SECRET_KEY):
        raise HTTPException(status_code=400, detail="Invalid signature")

    print("body", body)

    if event_type == "push":
        try:
            payload: PushEvent = PushEvent.model_validate_json(body)
        except ValidationError as e:
            print(f"Validation error: {e}")
            raise HTTPException(
                status_code=400, detail="Invalid push event payload structure"
            )

        # Now you can access attributes of the payload as expected
        eventPayload = EventPayload(
            event_name="push_event",
            service="github",
            params={
                "owner_name": payload.repository.owner.login,
                "repo_name": payload.repository.name,
                "branch": payload.ref,
            },
            context_params={
                "commit_msg": payload.head_commit.message,
                "author": payload.head_commit.author.name,
                "timestamp": payload.head_commit.timestamp,
                "commit_url": payload.head_commit.url,
                "author_email": payload.head_commit.author.email,
            },
        )
    elif event_type == "pull_request":
        try:
            payload: PullRequestEvent = PullRequestEvent.model_validate_json(body)
        except ValidationError as e:
            print(f"Validation error: {e}")
            raise HTTPException(
                status_code=400, detail="Invalid pull request event payload structure"
            )

        # Check if the pull request targets the 'main' branch
        base_branch = payload.pull_request.base.ref
        if base_branch != "main":
            print(f"Ignoring pull request targeting '{base_branch}' branch.")
            return {"status": "ignored"}

        eventPayload = EventPayload(
            event_name="pull_request_to_main",
            service="github",
            params={
                "owner_name": payload.repository.owner.login,
                "repo_name": payload.repository.name,
                "branch": "refs/heads/" + payload.pull_request.base.ref,
            },
            context_params={
                "title": payload.pull_request.title,
                "author": payload.pull_request.user.login,
                "timestamp": payload.pull_request.created_at,
                "pull_request_url": payload.pull_request.html_url,
                "author_email": (
                    payload.pull_request.user.email
                    if payload.pull_request.user.email
                    else "none"
                ),  # May be None
                "action_on_pull_request": payload.action,
            },
        )
    elif event_type == "workflow_run":
        # Parse the body into the WorkflowRunEvent model
        try:
            payload: WorkflowRunEvent = WorkflowRunEvent.model_validate_json(body)
        except ValidationError as e:
            print(f"Validation error: {e}")
            raise HTTPException(
                status_code=400, detail="Invalid workflow_run event payload structure"
            )

        # Check if the workflow run is for the desired branch
        workflow_run = payload.workflow_run
        branch = workflow_run.head_branch
        if branch != "main":
            print(f"Ignoring workflow run on branch '{branch}'.")
            return {"status": "ignored"}

        # Check the status and conclusion
        status = workflow_run.status  # "completed", "in_progress", "queued"
        conclusion = workflow_run.conclusion  # "success", "failure", etc.

        if status == "completed":
            if conclusion == "success":
                event_name = "ci_cd_pipeline_success"
            elif conclusion == "failure":
                event_name = "ci_cd_pipeline_failure"
            else:
                print(f"Ignoring workflow run with conclusion '{conclusion}'.")
                return {"status": "ignored"}

            # Construct EventPayload
            eventPayload = EventPayload(
                event_name=event_name,
                service="github",
                params={
                    "owner_name": payload.repository.owner.login,
                    "repo_name": payload.repository.name,
                    "branch": branch,
                },
                context_args={
                    "workflow_name": workflow_run.name,
                    "workflow_id": workflow_run.id,
                    "status": status,
                    "conclusion": conclusion,
                    "run_url": workflow_run.html_url,
                    "run_id": workflow_run.run_number,
                    "created_at": workflow_run.created_at,
                    "updated_at": workflow_run.updated_at,
                },
            )
        else:
            print(f"Ignoring workflow run with status '{status}'.")
            return {"status": "ignored"}
    else:
        print(f"Unhandled event type: {event_type}")
        return {"status": "ignored"}

    print(eventPayload)
    print(eventPayload.model_dump())

    response = requests.post(
        "http://area-core-api:8080/api/v1/events", json=eventPayload.model_dump()
    )
    print(response)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to post event: {response.text}",
        )

    return {"status": "success"}


def is_valid_signature(body, signature, secret):
    if not signature:
        return False  # Signature is missing
    mac = hmac.new(secret.encode(), msg=body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(expected_signature, signature)
