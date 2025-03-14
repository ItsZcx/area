from src.config import EnvFileLoader


class LlmSetting(EnvFileLoader):
    ORGANIZATION_ID: str
    PROJECT_ID: str
    OPENAI_API_KEY: str


llm_settings = LlmSetting()
