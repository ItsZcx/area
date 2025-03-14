from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

token_dependency = Annotated[str, Depends(oauth2_scheme)]
