import json
import re
from datetime import timedelta
from typing import Annotated

import httpx
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Path
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from starlette import status

from src.auth.config import GITHUB_SCOPES
from src.auth.config import auth_setting
from src.auth.config import oauth
from src.auth.models import GitHubToken as GitHubTokenModel
from src.auth.models import GoogleToken
from src.auth.models import Token
from src.auth.schemas import BasicToken
from src.auth.schemas import GitHubToken as GitHubTokenSchema
from src.auth.service import authenticate_user
from src.auth.service import bcrypt_hash
from src.auth.service import jwt_access_token
from src.auth.service import verify_google_id_token
from src.database import db_dependency
from src.user.models import User
from src.user.router import post_user
from src.user.schemas import CreateUserRequest
from src.user.schemas import User as UserSchema
from src.user.service import create_user
from src.user.service import get_user_model
from src.user.utils import is_valid_email

router = APIRouter(prefix="/auth", tags=["Authentication and Authorization"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserSchema,
    summary="Create a user",
    description="Creates a new user as long as it does not exist, if it does, it will return a 400 error",
)
def register_user(db: db_dependency, user_request: CreateUserRequest):
    if not is_valid_email(user_request.email):
        raise HTTPException(status_code=422, detail="Invalid email format")
    return post_user(db, user_request)


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=BasicToken,
    summary="Login with email and password",
    description="Login with email and password, returns a JWT token",
)
def token_login(db: db_dependency, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    email: str = form_data.username

    if not authenticate_user(db, email, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expiration = timedelta(minutes=auth_setting.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt_access_token(data={"sub": email}, expires_delta=access_token_expiration)
    return BasicToken(access_token=access_token, token_type="bearer")


@router.get(
    "/github",
    status_code=status.HTTP_302_FOUND,
    summary="Login with GitHub",
    description="Redirects to GitHub OAuth login page",
)
async def github(request: Request, scope: str = "repo,admin:repo_hook,user"):
    separated_scopes = None

    print("CURRENT SCOPE: ", scope)

    invalid_scope = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid scope",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if re.search(r",{2,}", scope) or scope.find(" ") != -1:
        raise invalid_scope

    separated_scopes = scope.split(",")
    for scope in separated_scopes:
        if not scope in GITHUB_SCOPES:
            raise invalid_scope

    redirect_uri = request.url_for("github_callback")
    # oauth.github.client_kwargs["scope"] = scope
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get(
    "/github/callback",
    status_code=status.HTTP_200_OK,
    summary="GitHub callback",
    description="Callback URL for GitHub OAuth",
)
async def github_callback(db: db_dependency, request: Request):
    res = await oauth.github.authorize_access_token(request)

    if not res:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error during authentification",
            headers={"WWW-Authenticate": "Bearer"},
        )

    github_token = GitHubTokenSchema(**res)

    if not "user" in github_token.scope:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scope, user scope is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # print("Github TOKEN SCOPE: ", github_token.scope)

    user = await oauth.github.get("user", token=res)
    data = user.json()
    email = data["email"]
    if email is None:
        emails = await oauth.github.get("user/emails", token=res)
        emailjson = emails.json()
        email = emailjson[0]["email"]
    username = data["login"]
    first_name = data["name"]

    user_model: User = get_user_model(db, email)

    if user_model is not None:
        # user_model.token.github_token.hashed_token = bcrypt_hash(
        #     github_token.access_token
        # )
        user_model.token.github_token.hashed_token = github_token.access_token
        user_model.token.github_token.token_type = github_token.token_type
        user_model.token.github_token.scope = github_token.scope

        # print("User Model: ", user_model)

    else:
        user_request = CreateUserRequest(
            username=username,
            password="",
            email=email,
            first_name=first_name,
            last_name="",
        )
        user_model = create_user(user_request_schema=user_request, github_token_schema=github_token)

    db.add(user_model)
    db.commit()

    jwt_expiration = timedelta(minutes=auth_setting.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt_access_token(data={"sub": email}, expires_delta=jwt_expiration)
    frontend_redirect_url = f"{auth_setting.FRONT_REDCIRECT_URL}/?access_token={token}"
    return RedirectResponse(url=frontend_redirect_url)
    # return BasicToken(access_token=token, token_type="bearer")

@router.post(
    "/github/callback/mobile",
    status_code=status.HTTP_200_OK,
    summary="GitHub callback for mobile",
    description="Callback URL for GitHub OAuth for mobile",
)
async def github_callback(request: Request, db: db_dependency):
    # Parse the request body to get the authorization code from the frontend
    print("Request: ", request)
    try:
        body = await request.json()
        print("Body: ", body)
        code = body.get("code")
        print("Code: ", code)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code missing",
            )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request body")

    print("after try catch")

    # Exchange the authorization code for an access token
    token_url = "https://github.com/login/oauth/access_token"
    client_id = auth_setting.GITHUB_MOBILE_CLIENT_ID
    client_secret = auth_setting.GITHUB_MOBILE_CLIENT_SECRET

    # GitHub expects this as a POST request
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": "myapp://",  # Should match your frontend redirect URI
    }
    headers = {"Accept": "application/json"}

    # Exchange the code for the access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=payload, headers=headers)
        token_data = token_response.json()

        print("Token Data: ", token_data)
        if "access_token" not in token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve GitHub access token",
            )

        github_token = token_data["access_token"]
        token_scopes = token_data.get("scope", "")
        token_type = token_data.get("token_type", "token")  # Default to 'token' if not provided

        print("GitHub Token: ", github_token)
        print("Token Scopes: ", token_scopes)
        print("Token Type: ", token_type)

        # Fetch the user data from GitHub using the access token
        try:
            user_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {github_token}"},  # Changed 'Bearer' to 'token'
            )
            user_response.raise_for_status()
            user_data = user_response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to retrieve user data: {str(e)}",
            )

        print("after user response")
        print("User Data: ", user_data)

        email = user_data.get("email")
        print("Email: ", email)
        if not email:
            # If email is not in user data, request additional scopes to get the email
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"token {github_token}"},  # Changed 'Bearer' to 'token'
            )
            emails_response.raise_for_status()
            emails_data = emails_response.json()
            email = emails_data[0]["email"]

        username = user_data.get("login")
        first_name = user_data.get("name", username)  # Fallback to GitHub login if no name is provided

    # Check if the user already exists in the database
    user_model: User = get_user_model(db, email)

    if user_model is not None:
        # If the user exists, update their GitHub token
        user_model.token.github_token.hashed_token = github_token
        user_model.token.github_token.token_type = token_type
        user_model.token.github_token.scope = token_scopes
    else:
        # If the user does not exist, create a new user
        user_request = CreateUserRequest(
            username=username,
            password="",
            email=email,
            first_name=first_name,
            last_name="",
        )
        github_token_schema = GitHubTokenSchema(
            access_token=github_token,
            token_type=token_type,
            scope=token_scopes,
        )
        user_model = create_user(
            user_request_schema=user_request, github_token_schema=github_token_schema
        )

    # Save the user in the database
    db.add(user_model)
    db.commit()

    # Generate a JWT for the user
    jwt_expiration = timedelta(minutes=auth_setting.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = jwt_access_token(data={"sub": email}, expires_delta=jwt_expiration)

    # Return the JWT to the frontend
    return JSONResponse(content={"access_token": jwt_token, "token_type": "bearer"})



# get github token per user
@router.get(
    "/github/token/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Get GitHub token | NEEDS SECURITY FIX",
    description="Get the GitHub token for a user | NEEDS SECURITY FIX",
)
def get_github_token(db: db_dependency, user_id: int = Path(ge=0)):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    github_oauth_token = user.token.github_token
    if github_oauth_token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have a GitHub token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return github_oauth_token


# GOOGLE AUTH
@router.get(
    "/google",
    status_code=status.HTTP_302_FOUND,
    summary="Login with Google",
    description="Redirects to Google OAuth login page",
)
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get(
    "/google/callback",
    status_code=status.HTTP_200_OK,
    summary="Google callback",
    description="Callback URL for Google OAuth",
)
async def google_callback(request: Request, db: db_dependency):
    # Retrieve the OAuth token response from Google

    print("Endpoint google/callback called")
    token = await oauth.google.authorize_access_token(request)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication failed",
        )

    # Use the 'id_token' for user information
    id_token = token.get("id_token")
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID Token is missing.",
        )

    # Parse and verify the 'id_token' manually
    try:
        user_info = verify_google_id_token(id_token, platform="web")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify ID Token: {str(e)}",
        )

    # Extract user details from the 'id_token'
    email = user_info.get("email")
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required but not found in the ID Token.",
        )

    # Check if the user exists in the database
    user_model: User = get_user_model(db, email)
    if user_model is not None:
        # Update the existing user's Google token in the database
        if user_model.token is None:
            user_model.token = Token()  # Ensure Token exists for the user
        user_model.token.google_token = GoogleToken(
            access_token=token["access_token"],
            refresh_token=token.get("refresh_token"),
            token_type=token["token_type"],
            scope=token["scope"],
            expires_at=token["expires_at"],
        )
    else:
        # Create a new user and associate the tokens
        user_request = CreateUserRequest(
            username=email.split("@")[0],
            password="",  # Handle password appropriately for OAuth users
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user_model = create_user(user_request_schema=user_request)
        user_model.token = Token()
        user_model.token.google_token = GoogleToken(
            access_token=token["access_token"],
            refresh_token=token.get("refresh_token"),
            token_type=token["token_type"],
            scope=token["scope"],
            expires_at=token["expires_at"],
        )
        ## inti also the github token
        user_model.token.github_token = GitHubTokenModel()

    db.add(user_model)
    db.commit()

    # Generate a JWT token for the user to authenticate within your app
    jwt_expiration = timedelta(minutes=auth_setting.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = jwt_access_token(data={"sub": email}, expires_delta=jwt_expiration)
    frontend_redirect_url = f"{auth_setting.FRONT_REDCIRECT_URL}/?access_token={jwt_token}"
    return RedirectResponse(url=frontend_redirect_url)
    # return BasicToken(access_token=jwt_token, token_type="bearer")


@router.post(
    "/google/callback/mobile",
    status_code=status.HTTP_200_OK,
    summary="Google callback for mobile",
    description="Callback URL for Google OAuth for mobile",
)
async def google_callback(request: Request, db: db_dependency):
    # Retrieve the OAuth token response from Google
    try:
        # First, parse the raw body as JSON
        body = await request.body()
        data = json.loads(body.decode("utf-8"))  # Decode and parse the JSON body
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON body")

    print("Parsed Data: ", data)

    token = data.get("token")  # Safely access 'token' key
    platform = data.get("platform")  # Safely access 'platform' key

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication failed, token missing",
        )

    print("Token on backend !!: ", token)

    # Extract the 'idToken' for user information
    id_token = token.get("idToken")
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID Token is missing.",
        )

    print("ID Token: ", id_token)
    # Parse and verify the 'id_token' manually
    # ! userinfo... error
    try:
        user_info = verify_google_id_token(id_token, platform)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify ID Token: {str(e)}",
        )

    # Extract user details from the 'id_token'
    email = user_info.get("email")
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required but not found in the ID Token.",
        )

    # Check if the user exists in the database
    user_model: User = get_user_model(db, email)
    if user_model is not None:
        # Update the existing user's Google token in the database
        if user_model.token is None:
            user_model.token = Token()  # Ensure Token exists for the user
        user_model.token.google_token = GoogleToken(
            access_token=token["accessToken"],  # Fixed key for access token
            refresh_token=token.get("refreshToken"),
            token_type=token["tokenType"],
            scope=token["scope"],
            expires_at=token.get("expiresIn"),  # Or calculate the expiration based on the timestamp
        )
    else:
        # Create a new user and associate the tokens
        user_request = CreateUserRequest(
            username=email.split("@")[0],
            password="",  # Handle password appropriately for OAuth users
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user_model = create_user(user_request_schema=user_request)
        user_model.token = Token()
        user_model.token.google_token = GoogleToken(
            access_token=token["accessToken"],
            refresh_token=token.get("refreshToken"),
            token_type=token["tokenType"],
            scope=token["scope"],
            expires_at=token.get("expiresIn"),
        )
        ## Initialize also the github token if necessary
        user_model.token.github_token = GitHubTokenModel()

    db.add(user_model)
    db.commit()

    # Generate a JWT token for the user to authenticate within your app
    jwt_expiration = timedelta(minutes=auth_setting.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = jwt_access_token(data={"sub": email}, expires_delta=jwt_expiration)
    return JSONResponse(content={"access_token": jwt_token, "token_type": "bearer"})


# get google token per user
@router.get(
    "/google/token/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Google token by user ID | NEEDS SECURITY FIX",
    description="Get the Google token for a user with the specified user ID | NEEDS SECURITY FIX",
)
def get_google_token(db: db_dependency, user_id: int = Path(ge=0)):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    google_oauth_token = user.token.google_token
    if google_oauth_token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have a Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print("Google Token: ", google_oauth_token)

    return google_oauth_token


# get google token email
@router.get(
    "/google/token/email/{email}",
    status_code=status.HTTP_200_OK,
    summary="Get Google token by email | NEEDS SECURITY FIX",
    description="Get the Google token for a user with the specified email | NEEDS SECURITY FIX",
)
def get_google_token(db: db_dependency, email: str):
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.token.google_token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have a Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user.token.google_token
