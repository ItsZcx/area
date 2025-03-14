# package-specific business logic
from src.webhook.service import repository_create_webhook


def repository_CI_CD_pipeline_create_webhook(trigger_args: list, oauth_token: str):
    repository_create_webhook(trigger_args, "workflow_run", oauth_token)


def repository_push_create_webhook(trigger_args: list, oauth_token: str):
    repository_create_webhook(trigger_args, "push", oauth_token)


def repository_pull_request_create_webhook(trigger_args: list, oauth_token: str):
    repository_create_webhook(trigger_args, "pull_request", oauth_token)
