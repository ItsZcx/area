# This file is made for defining actions linked to the taks
from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Session
import traceback
from src.task.models import Task
from src.task.utils import action_registry


def get_action_func(event_service, action_name):
    # First, look in the event-specific actions
    event_actions = action_registry.get(event_service, {})
    action_func = event_actions.get(action_name)

    if action_func:
        return action_func, False  # Found in the event-specific registry
    
    # Next, look in common actions
    common_action = action_registry.get("common", {}).get(action_name)
    if common_action:
        return common_action, True  # Found in common actions
    
    # Next, look in reddit actions
    reddit_action = action_registry.get("reddit", {}).get(action_name)
    if reddit_action:
        return reddit_action, True  # Found in reddit actions
    
    # Finally, look in crypto actions
    crypto_action = action_registry.get("crypto", {}).get(action_name)
    if crypto_action:
        return crypto_action, True  # Found in crypto actions

    # If not found in any registry, raise an error
    raise KeyError(f"Action '{action_name}' not found for event '{event_service}', common, reddit, or crypto actions")


# {
#   "event_name": "push_event",
#   "service": "github",
#   "params": {
#       "service": "github"}
# }


# event is getted on the reciever and kwargs also... (knwars can we whatever...)
def execute_actions(
    db: Session, special_tasks: List[Task], event_name: String, service: String, event_hash: String, **kwargs
):
    tasks_with_event = db.query(Task).filter(Task.event_hash == event_hash).all()
    if special_tasks:
        tasks_with_event += special_tasks
    action_name = None
    print("tasks_with_event", tasks_with_event)
    for task in tasks_with_event:
        action_name = task.action_name
        print("action_name on task", action_name)
        action, is_common = get_action_func(service, task.action_name)
        try:
            execute_action(action, is_common, task, db, **kwargs)
        except Exception as e:
            print(f"ERROR executing action '{action_name}' for task '{task}': {e}")
            # Optionally, you can log the exception traceback for more details
            traceback.print_exc()
            # Continue with the next task
            print("CONTINUING with the next task...")
            continue
    return action_name


# exacution for common aciton we want extra info fo the service in order to render dyamci templates for generic emails sms...
def execute_action(action, is_common, task, db, **kwargs):
    # if common pass the service from...
    if is_common:
        service_from = kwargs.get("service_from")
        return action(service_from=service_from, task=task, db=db, **kwargs)
    else:
        # If not common, just pass the rest of the kwargs
        return action(task, db, **kwargs)
