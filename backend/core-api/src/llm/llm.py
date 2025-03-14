# This file is made for putting all the actions that can be executed by the tasks

# email_utils.py
from openai import OpenAI

from src.llm.config import llm_settings


def get_openai_client():
    return OpenAI(
        organization=llm_settings.ORGANIZATION_ID,
        project=llm_settings.PROJECT_ID,
        api_key=llm_settings.OPENAI_API_KEY,
    )
