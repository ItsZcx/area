# package-specific config/constants
from src.config import EnvFileLoader


class TriggerSetting(EnvFileLoader):
    CUSTOM_ENV_VAR: str


trigger_setting = TriggerSetting()
