from starlette.config import Config

from src.config import EnvFileLoader


class TaskSetting(EnvFileLoader):
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_OPENID_CONFIG: str


task_setting = TaskSetting()


CONFIG_DATA = {
    "CLIENT_ID_GITHUB": task_setting.GITHUB_CLIENT_ID,
    "CLIENT_SECRET_GITHUB": task_setting.GITHUB_CLIENT_SECRET,
    "GOOGLE_CLIENT_ID": task_setting.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": task_setting.GOOGLE_CLIENT_SECRET,
    "GOOGLE_OPENID_CONFIG": task_setting.GOOGLE_OPENID_CONFIG,
}

starlette_config = Config(environ=CONFIG_DATA)
