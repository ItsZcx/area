from sqlalchemy.orm import Session

from src.auth.models import GitHubToken as GitHubTokenModel
from src.auth.models import GoogleToken as GoogleTokenModel
from src.auth.models import Token
from src.auth.schemas import GitHubToken as GitHubTokenSchema
from src.auth.schemas import GoogleToken as GoogleTokenSchema
from src.auth.service import bcrypt_hash
from src.user.models import User
from src.user.schemas import CreateUserRequest
from src.user.schemas import UserInDB


def get_user(db: Session, email: str) -> UserInDB | None:
    """
    Retrieve a user from the database by their email.

    Args:
        db (Session): The database session to use for the query.
        email (str): The email of the user to retrieve.

    Returns:
        UserInDB: An instance of UserInDB containing the user's details if found.
        None: If no user with the given email is found.
    """
    user_model = db.query(User).where(User.email == email).first()

    if user_model is not None:
        return UserInDB(
            id=user_model.id,
            username=user_model.username,
            email=user_model.email,
            first_name=user_model.first_name,
            phone_number=user_model.phone_number,
            last_name=user_model.last_name,
            disabled=user_model.disabled,
            role=user_model.role,
            hashed_password=user_model.hashed_password,
            token=user_model.token,
            plan=user_model.plan,
        )
    return None


def get_user_model(db: Session, email: str) -> User | None:
    """
    Retrieve a user from the database by their email.

    Args:
        db (Session): The database session to use for the query.
        email (str): The email of the user to retrieve.

    Returns:
        User: An instance of the SQLAlchemy User model if found.
        None: If no user with the given email is found.
    """
    return db.query(User).filter(User.email == email).first()


def create_user(
    user_request_schema: CreateUserRequest,
    github_token_schema: GitHubTokenSchema = GitHubTokenSchema(),
    google_token_schema: GoogleTokenSchema = GoogleTokenSchema(),
) -> User:
    """
    Creates a new user along with associated GitHub and Google token models.

    Args:
        user_request_schema (CreateUserRequest): Schema containing user details.
        github_token_schema (GitHubToken (Schema), optional): Schema containing GitHub token details. Defaults to an empty GitHubToken (Schema).
        google_token_schema (GoogleToken (Schema), optional): Schema containing Google token details. Defaults to an empty GoogleToken (Schema).

    Returns:
        User: The created user model.
    """
    user_model = User(
        username=user_request_schema.username,
        email=user_request_schema.email,
        first_name=user_request_schema.first_name,
        last_name=user_request_schema.last_name,
        phone_number=user_request_schema.phone_number,
        role=user_request_schema.role,
        hashed_password=bcrypt_hash(user_request_schema.password),
        disabled=False,
    )

    token_model = Token(user=user_model)

    # print("github_token_schema->", github_token_schema)
    # print("google_token_schema->", google_token_schema)

    try:
        github_token_model = GitHubTokenModel(
            hashed_token=github_token_schema.access_token,
            token_type=github_token_schema.token_type,
            scope=github_token_schema.token_type,
            token=token_model,
        )
    except:
        github_token_model = GitHubTokenModel(
            hashed_token=github_token_schema["access_token"],
            token_type=github_token_schema["token_type"],
            scope=github_token_schema["token_type"],
            token=token_model,
        )

    google_token_model = GoogleTokenModel(
        access_token=google_token_schema.access_token,
        refresh_token=google_token_schema.refresh_token,
        token_type=google_token_schema.token_type,
        scope=google_token_schema.scope,
        expires_at=google_token_schema.expires_at,
        token=token_model,
    )

    return user_model
