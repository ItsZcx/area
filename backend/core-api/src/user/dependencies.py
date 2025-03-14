from typing import Annotated

import jwt
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from jwt.exceptions import InvalidTokenError

from src.auth.config import auth_setting
from src.auth.dependencies import token_dependency
from src.database import db_dependency
from src.user.schemas import UserInDB
from src.user.service import get_user


def get_current_user(db: db_dependency, token: token_dependency):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )  # we put this header to be compliant with the specifications.

    try:
        payload = jwt.decode(token, auth_setting.JWT_SECRET_KEY, algorithms=[auth_setting.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = get_user(db, email=email)
    if user is None:
        raise credentials_exception
    return user


current_user_dependency = Annotated[UserInDB, Depends(get_current_user)]
"""Checks that -> -> JWT token is valid -> User exists in the database"""


def get_current_active_user(current_user: current_user_dependency):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


current_active_user_dependency = Annotated[UserInDB, Depends(get_current_active_user)]
"""Checks that -> JWT token is valid -> User exists in the database -> User is active"""
