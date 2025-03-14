# package-specific config/constants
from src.config import EnvFileLoader


class WebhookSetting(EnvFileLoader):
    CUSTOM_ENV_VAR: str


webhook_setting = WebhookSetting()
