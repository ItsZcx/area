from datetime import datetime
from datetime import timedelta
from datetime import timezone

import jwt  # PyJWT
import requests
from fastapi import HTTPException
from jwt import algorithms
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status
from web3 import Web3

from src.auth.config import auth_setting

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def bcrypt_verify(plain_str: str | bytes, hashed_str: str | bytes) -> bool:
    """
    Verify a plain string/bytes against a hashed one.

    Args:
        plain_str (str | bytes): The plain text to verify.
        hashed_str (str | bytes): The hashed text to verify against.

    Returns:
        bool: True if the plain text matches the hashed text, False otherwise.
    """
    return bcrypt_context.verify(plain_str, hashed_str)


def bcrypt_hash(text: str | bytes) -> str:
    """
    Hashes a given string/bytes using the bcrypt algorithm.

    Args:
        text (str | bytes): The plain text to be hashed.

    Returns:
        str: The hashed text.
    """
    return bcrypt_context.hash(text)


def authenticate_user(db: Session, email: str, password: str) -> bool:
    """
    Authenticates a user by verifying their email and password.

    Args:
        db (Session): The database session to use for querying the user.
        email (str): The email of the user to authenticate.
        password (str): The plain text password of the user to authenticate.
    Returns:
        bool: True if authenticated, False otherwise.
    """
    from src.user.service import get_user

    user = get_user(db, email=email)

    if not user:
        return False
    if not bcrypt_verify(password, user.hashed_password):
        return False
    return True


def jwt_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Creates a JSON Web Token (JWT) for the given data with an optional expiration time.

    Args:
        data (dict): The data to encode in the JWT.
        expires_delta (timedelta | None, optional): The time duration after which the token will expire.
            If not provided, the token will expire in 15 minutes.

    Returns:
        str: The encoded JWT as a string.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, auth_setting.JWT_SECRET_KEY, algorithm=auth_setting.JWT_ALGORITHM)
    return encoded_jwt


def send_usdc(to_address: str, token_amount: int):
    """
    Sends a specified amount of USDC tokens to a given address.

    Args:
        to_address (str): The recipient's Ethereum address.
        token_amount (int): The amount of USDC tokens to send (in whole units, not scaled).

    Raises:
        ValueError: If the private key or RPC URL is not provided.
        ConnectionError: If unable to connect to the Ethereum network.
        Exception: If there is an error sending the transaction.

    Returns:
        None
    """
    usdc_address = Web3.to_checksum_address("0xAe045DE5638162fa134807Cb558E15A3F5A7F853")
    sanitized_to_address = Web3.to_checksum_address(to_address)
    if not auth_setting.CRYPTO_PAYMENTS_PRIVATE_KEY:
        raise ValueError("Private key not provided.")
    if not auth_setting.ZK_SYNC_SEPOLIA_RPC_URL:
        raise ValueError("RPC URL not provided.")

    w3 = Web3(Web3.HTTPProvider(auth_setting.ZK_SYNC_SEPOLIA_RPC_URL))

    # Check for connection to the Ethereum network
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to HTTPProvider")

    contract_abi = [
        {
            "constant": True,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "payable": False,
            "stateMutability": "view",
            "type": "function",
        },
        {
            "constant": False,
            "inputs": [
                {"name": "_to", "type": "address"},
                {"name": "_value", "type": "uint256"},
            ],
            "name": "transfer",
            "outputs": [{"name": "success", "type": "bool"}],
            "payable": False,
            "stateMutability": "nonpayable",
            "type": "function",
        },
        # Include other necessary functions if needed
    ]

    usdc_contract = w3.eth.contract(address=usdc_address, abi=contract_abi)

    nonce = w3.eth.get_transaction_count(w3.eth.account.from_key(auth_setting.CRYPTO_PAYMENTS_PRIVATE_KEY).address)

    scaled_amount = token_amount

    transaction = usdc_contract.functions.transfer(sanitized_to_address, scaled_amount).build_transaction(
        {
            "chainId": 300,
            "gas": 6000000,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce,
        }
    )

    # Sign the transaction with the private key
    signed_txn = w3.eth.account.sign_transaction(transaction, auth_setting.CRYPTO_PAYMENTS_PRIVATE_KEY)

    # Attempt to send the transaction
    try:
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction sent! Hash: {tx_hash.hex()}")
    except Exception as e:
        print(f"Error sending transaction: {e}")


def get_google_jwk():
    # Fetch Google's OpenID configuration to get the JWKS URL
    response = requests.get(auth_setting.GOOGLE_OPENID_CONFIG)
    jwks_uri = response.json().get("jwks_uri")

    # Fetch the actual keys
    jwks_response = requests.get(jwks_uri)
    return jwks_response.json()


def verify_google_id_token(id_token: str, platform: str):
    # Fetch the JWK keys
    jwks = get_google_jwk()
    unverified_header = jwt.get_unverified_header(id_token)

    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
            break

    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to find appropriate key in JWKS",
        )

    # print("platform on verigy google id", platform)
    # print("all ids", auth_setting.IOS_CLIENT_ID, auth_setting.ANDROID_CLIENT_ID, auth_setting.GOOGLE_CLIENT_ID)
    # Choose the correct client ID based on the platform
    if platform == "ios":
        audience = auth_setting.IOS_CLIENT_ID  # Your iOS Client ID
    elif platform == "android":
        audience = auth_setting.ANDROID_CLIENT_ID  # Your Android Client ID
    elif platform == "web":
        audience = auth_setting.GOOGLE_CLIENT_ID  # Your Web Client ID
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid platform specified.",
        )

    try:
        # Decode and verify the token using Google's public key
        payload = jwt.decode(
            id_token,
            key=algorithms.RSAAlgorithm.from_jwk(rsa_key),
            algorithms=["RS256"],
            audience=audience,  # Use the correct client ID based on the platform
            issuer="https://accounts.google.com",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID Token has expired.",
        )
    except jwt.JWTClaimsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID Token claims. Please check the audience and issuer.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to verify ID Token: {str(e)}",
        )
