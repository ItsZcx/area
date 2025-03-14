# This file is made for putting all the actions that can be executed by the tasks
import hashlib

# email_utils.py
import os
import smtplib
from email.message import EmailMessage

from src.event.schemas import EmailFromPerson
from src.event.schemas import EmailToPerson
from src.event.schemas import GithubEventArgs
from src.event.schemas import RecipientAddress
from src.reaction_general.google_cal_event import create_google_cal_event
from src.reaction_general.reddit import post_new_comment_on_post
from src.reaction_general.reddit import post_new_submission
from src.reaction_general.reddit import send_private_message
from src.reaction_general.send_email import send_email
from src.reaction_general.send_sms import send_sms
from src.reaction_general.send_usdc import transfer_usdc
from src.task.schemas import CalendarCalendarReactionsArgsFronted
from src.task.schemas import CalendarReactionsArgs
from src.task.schemas import PostNewCommentOnPostArgs
from src.task.schemas import PostNewSubmissionArgs
from src.task.schemas import SendPrivateMessageArgs


# Event-specific actions
def create_github_issue(task=None, db=None, **kwargs):
    # Implement GitHub issue creation logic here
    return f"GitHub issue created with: {kwargs}"


def is_valid_action(action_name):
    for event_type, actions in action_registry.items():
        if action_name in actions:
            return True
    return False


# GENERAL ACTION REGISTRY we have comon acitons and acitons linkded to specific microservices

action_registry = {
    "common": {
        "send_email": send_email,
        "send_sms": send_sms,
    },
    "github": {
        "create_github_issue": create_github_issue,  # not operrative yet
        # Include 'send_email' if you have event-specific implementations
        "create_google_cal_event": create_google_cal_event,
    },
    "google": {
        "create_google_cal_event": create_google_cal_event,
    },
    "crypto": {
        "send_usdc": transfer_usdc,
    },
    "reddit": {
        "send_private_message": send_private_message,
        "post_new_submission": post_new_submission,
        "post_new_comment_on_post": post_new_comment_on_post,
    },
}

# reaction_params neede for the (reactions) -> **action_params** (none if not needed)
action_to_params = {
    "send_email": None,
    "send_sms": None,
    "create_google_cal_event": CalendarCalendarReactionsArgsFronted,
    "send_private_message": SendPrivateMessageArgs,
    "post_new_submission": PostNewSubmissionArgs,
    "post_new_comment_on_post": PostNewCommentOnPostArgs,
    "create_github_issue": None,  # TODO -> create the parameters needed for crating issue.
    "send_usdc": RecipientAddress,
}

# This are the service, trigger and trigger args
event_registry = {
    "github": {
        "push_event": GithubEventArgs,
        "pull_request_to_main": GithubEventArgs,
        "ci_cd_pipeline": GithubEventArgs,
    },
    "google": {
        "email_received": None,
        "email_sent_to_person": EmailToPerson,
        "email_received_from_person": EmailFromPerson,
        "email_sent": None,
        "calendar_event_created": None,
    },
}


"""
3. Why You Should Use Deterministic Hashing (e.g., SHA256) Instead of bcrypt
Since you're comparing the hash directly between stored and computed values,
you should use a deterministic hashing algorithm like SHA256.
This way, hashing the same input (event name and arguments) will always result in the same hash,
allowing you to compare them directly.

If you continue using bcrypt, you'd need to use bcrypt_verify every time you compare a hash,
which would add unnecessary complexity and performance overhead.
A better approach in your case is to stick with SHA256 or a similar
deterministic hash function since you're storing and later comparing hashes directly.
"""


def generate_event_hash(trigger: str, args: list) -> str:
    """
    Generates a SHA256 hash for a given event trigger and its arguments.
    More information on why deterministic hashing is used instead of bcrypt is provided above function declaration.

    Args:
        trigger (str): The name of the event trigger.
        args (list): A list of arguments associated with the event.
    Returns:
        str: A SHA256 hash string representing the event.
    """
    print("trigger on hash event", trigger)
    print("args on hash evetn", args)

    # Join the event name and sorted args to ensure consistent hash input
    hash_input = trigger + ":" + ":".join(sorted(args))
    # Use SHA256 for deterministic hashing
    return hashlib.sha256(hash_input.encode()).hexdigest()
