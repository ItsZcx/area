from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

from src.config import EnvFileLoader

GITHUB_SCOPES = [
    "repo",
    "repo:status",
    "repo_deployment",
    "public_repo",
    "repo:invite",
    "security_events",
    "admin:repo_hook",
    "write:repo_hook",
    "read:repo_hook",
    "admin:org",
    "write:org",
    "read:org",
    "admin:public_key",
    "write:public_key",
    "read:public_key",
    "admin:org_hook",
    "gist",
    "notifications",
    "user",
    "read:user",
    "user:email",
    "user:follow",
    "project",
    "read:project",
    "delete_repo",
    "write:packages",
    "read:packages",
    "delete:packages",
    "admin:gpg_key",
    "write:gpg_key",
    "read:gpg_key",
    "codespace",
    "workflow",
]


class AuthSetting(EnvFileLoader):
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_OPENID_CONFIG: str

    FRONT_REDCIRECT_URL: str

    IOS_CLIENT_ID: str
    ANDROID_CLIENT_ID: str

    GITHUB_MOBILE_CLIENT_ID: str
    GITHUB_MOBILE_CLIENT_SECRET: str

    CRYPTO_PAYMENTS_PRIVATE_KEY: str
    ZK_SYNC_SEPOLIA_RPC_URL: str


auth_setting = AuthSetting()


CONFIG_DATA = {
    "CLIENT_ID_GITHUB": auth_setting.GITHUB_CLIENT_ID,
    "CLIENT_SECRET_GITHUB": auth_setting.GITHUB_CLIENT_SECRET,
    "GOOGLE_CLIENT_ID": auth_setting.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": auth_setting.GOOGLE_CLIENT_SECRET,
    "GOOGLE_OPENID_CONFIG": auth_setting.GOOGLE_OPENID_CONFIG,
    "FRONT_REDCIRECT_URL": auth_setting.FRONT_REDCIRECT_URL,
    "IOS_CLIENT_ID": auth_setting.IOS_CLIENT_ID,
    "ANDROID_CLIENT_ID": auth_setting.ANDROID_CLIENT_ID,
    "GITHUB_MOBILE_CLIENT_ID": auth_setting.GITHUB_MOBILE_CLIENT_ID,
    "GITHUB_MOBILE_CLIENT_SECRET": auth_setting.GITHUB_MOBILE_CLIENT_SECRET,
    "CRYPTO_PAYMENTS_PRIVATE_KEY": auth_setting.CRYPTO_PAYMENTS_PRIVATE_KEY,
    "ZK_SYNC_SEPOLIA_RPC_URL": auth_setting.ZK_SYNC_SEPOLIA_RPC_URL,
}

starlette_config = Config(environ=CONFIG_DATA)

oauth = OAuth(starlette_config)

oauth.register(
    name="github",
    client_id=auth_setting.GITHUB_CLIENT_ID,
    client_secret=auth_setting.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    access_token_params=None,
    authorize_url="https://github.com/login/oauth/authorize",
    authorize_params=None,
    api_base_url="https://api.github.com/",
    refresh_token_url=None,
    redirect_uri="http://localhost:8080/",
    # client_kwargs={"scope": GITHUB_SCOPES},
    client_kwargs={"scope": "repo,admin:repo_hook,user"},
    debug=True,
)


oauth.register(
    name="google",
    client_id=auth_setting.GOOGLE_CLIENT_ID,
    client_secret=auth_setting.GOOGLE_CLIENT_SECRET,
    access_token_url="https://oauth2.googleapis.com/token",
    authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
    api_base_url="https://www.googleapis.com/",
    client_kwargs={
        "scope": "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly",
    },
    authorize_params={
        "access_type": "offline",  # Place access_type here
        "prompt": "consent",  # Place prompt here
    },
    # Add the server_metadata_url for Google's OpenID Connect configuration
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
)
