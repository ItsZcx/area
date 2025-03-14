from fastapi import APIRouter
from fastapi import Body
from fastapi import HTTPException
from fastapi import Path
from sqlalchemy.orm import defer
from starlette import status

from src.auth.schemas import GoogleTokenInDB
from src.auth.service import bcrypt_hash
from src.database import db_dependency
from src.user.dependencies import current_active_user_dependency
from src.user.models import GmailWebHookInfo
from src.user.models import User as UserModel
from src.user.schemas import CreateUserRequest
from src.user.schemas import GmailWebHookInfoSchema
from src.user.schemas import UpdateUserHistory
from src.user.schemas import User as UserSchema
from src.user.schemas import UserInDB
from src.user.schemas import UserResponse
from src.user.service import create_user
from src.user.service import get_user as _get_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=list[UserSchema],
    summary="Get all users",
    description="Returns a list with all the currently created users",
)
def get_user(db: db_dependency):
    return db.query(UserModel).options(defer(UserModel.hashed_password)).all()


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=UserSchema,
    summary="Create a user",
    description="Creates a new user as long as it does not exist, if it does, it will return a 400 error",
)
def post_user(db: db_dependency, user_request: CreateUserRequest):
    if _get_user(db, user_request.email) is not None:
        raise HTTPException(status_code=400, detail="Email already in use")

    new_user_model = create_user(user_request)

    db.add(new_user_model)
    db.commit()

    user: UserSchema = UserSchema(**_get_user(db, user_request.email).model_dump())
    return user


@router.delete(
    "",
    status_code=status.HTTP_200_OK,
    summary="Delete all users",
    description="Deletes all users, if there are no users, it will return a 404 error",
)
def delete_user(db: db_dependency):
    users = db.query(UserModel).all()

    if users.__len__() == 0:
        raise HTTPException(status_code=404, detail="Users not found")

    db.query(UserModel).delete()
    db.commit()


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=UserInDB,
    summary="Get loged in user",
    description="Returns the user that is currently logged in, with private information",
)
def read_user_me(current_user: current_active_user_dependency):
    return current_user


@router.get(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserSchema,
    summary="Get user by id",
    description="Returns the user with the specified id without highly private information, if the user does not exist, it will return a 404 error",
)
def get_user(db: db_dependency, user_id: int = Path(ge=0)):
    model = db.query(UserModel).filter(UserModel.id == user_id).first()

    if model is not None:
        return model
    raise HTTPException(status_code=404, detail="User not found")


@router.put(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Update user by id",
    description="Update user properties by id, if the user does not exist, it will return a 404 error",
)
def update_user(db: db_dependency, user_request: CreateUserRequest, user_id: int = Path(ge=0)):
    model = db.query(UserModel).filter(UserModel.id == user_id).first()

    if model is None:
        raise HTTPException(status_code=404, detail="User not found")

    model.username = user_request.username
    model.email = user_request.email
    model.first_name = user_request.first_name
    model.last_name = user_request.last_name
    model.role = user_request.role
    model.phone_number = user_request.phone_number
    model.hashed_password = bcrypt_hash(user_request.password)
    model.disabled = False

    db.add(model)
    db.commit()


@router.patch(
    "/{user_id}", status_code=status.HTTP_200_OK, summary="Patch user by id", description="Update user properties by id"
)
def patch_user(db: db_dependency, user_request: dict = Body(...), user_id: int = Path(ge=0)):
    model = db.query(UserModel).filter(UserModel.id == user_id).first()

    if model is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Handle change to Username that already exists in DB
    # Handle change to invalid field (password hashed password)
    # Might be better to just delete this lol

    for key, value in user_request.items():
        if hasattr(model, key):
            setattr(model, key, value)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid field: {key}")

    db.add(model)
    db.commit()


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete user by id",
    description="Deletes a user by id, if the user does not exist, it will return a 404 error",
)
def delete_user(db: db_dependency, user_id: int = Path(ge=0)):
    model = db.query(UserModel).filter(UserModel.id == user_id).first()

    if model is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(UserModel).filter(UserModel.id == user_id).delete()
    db.commit()


@router.get(
    "/google_token",
    status_code=status.HTTP_200_OK,
    response_model=GoogleTokenInDB,
    summary="Get google token of current user",
    description="Returns the google token of the user that is currently logged in",
)
def get_google_token(db: db_dependency, current_user: current_active_user_dependency):
    user = db.query(UserModel).filter(UserModel.id == current_user.id).first()
    google_token = user.token.google_token
    return GoogleTokenInDB(
        id=google_token.id,
        access_token=google_token.access_token,
        refresh_token=google_token.refresh_token,
        token_type=google_token.token_type,
        scope=google_token.scope,
        expires_at=google_token.expires_at,
    )


@router.get(
    "/gmail/watch_info/{email}",
    status_code=status.HTTP_200_OK,
    response_model=GmailWebHookInfoSchema,
    summary="Get gmail webhook info",
    description="Returns the gmail webhook info of the user with the specified email, if the user does not exist, it will return a 404 error",
)
def get_gmail_webhook_info(db: db_dependency, email: str = Path(...)):
    user = db.query(UserModel).filter(UserModel.email == email).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    watch_info = user.gmail_webhook_info
    if watch_info is None:
        return None

    return GmailWebHookInfoSchema(
        resource_id=watch_info.resource_id,
        gmail_history_id=watch_info.gmail_history_id,
        gmail_expiration_date=watch_info.gmail_expiration_date,
    )


@router.get(
    "/gmail/watch_info/user_id/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
    summary="Get user with gmail webhook info by user id",
    description="Returns the user with the specified id and the gmail webhook info, if the user does not exist, it will return a 404 error",
)
def get_gmail_webhook_info(db: db_dependency, user_id: str = Path(...)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put(
    "/gmail/watch_info/{email}",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
    summary="Update gmail webhook info",
    description="Update the gmail webhook info of the user with the specified email, if the user does not exist, it will return a 404 error. It returns the updated user",
)
def update_history_id(db: db_dependency, user_request: UpdateUserHistory, email: str = Path(...)):
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # gmail and oatuh token get that -> also
    user.gmail_webhook_info = GmailWebHookInfo(
        gmail_history_id=user_request.gmail_history_id,
        user_id=user_request.user_id,
        gmail_expiration_date=user_request.gmail_expiration_date,
        resource_id=user_request.resource_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.put("/plan/{user_id}", status_code=status.HTTP_200_OK, description="Update user plan")
def update_user_plan(db: db_dependency, user_id: int = Path(gt=0), plan: str = Body(...)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.plan = plan

    db.add(user)
    db.commit()
    
    return user

@router.get(
    "/services/{user_id}",
    status_code=status.HTTP_200_OK,
    response_model=list[str],
    summary="Get services connected to user",
    description="Returns a list of the services connected to the user, if the user does not exist, it will return a 404 error",
)
def get_services(db: db_dependency, user_id: int = Path(ge=0)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    connected_services: list[str] = []

    for task in user.tasks:
        if task.service not in connected_services:
            connected_services.append(task.service)

    return connected_services
