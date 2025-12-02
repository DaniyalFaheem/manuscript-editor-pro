"""
Authentication routes for user management and token generation.
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from api.schemas import (
    APIKeyCreate,
    APIKeyResponse,
    Token,
    TokenData,
    UserCreate,
    UserResponse,
)
from api.middleware.auth import (
    create_access_token,
    get_password_hash,
    require_auth,
    verify_password,
)
from config.settings import settings


router = APIRouter()


# In-memory user storage (use database in production)
fake_users_db: dict[str, dict] = {}
fake_api_keys_db: dict[str, dict] = {}


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account for API access.",
)
async def register(user: UserCreate):
    """Register a new user."""
    # Check if email already exists
    if user.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    fake_users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    
    return UserResponse(
        id=user_id,
        email=user.email,
        name=user.name,
        created_at=fake_users_db[user.email]["created_at"],
    )


@router.post(
    "/token",
    response_model=Token,
    summary="Get access token",
    description="Authenticate and receive a JWT access token.",
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token."""
    # Find user
    user = fake_users_db.get(form_data.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "scopes": ["analyze", "results", "feedback"],
        },
        expires_delta=access_token_expires,
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user.",
)
async def get_current_user_info(
    current_user: TokenData = Depends(require_auth),
):
    """Get current user information."""
    email = current_user.sub
    
    # Handle API key authentication
    if email.startswith("api_key:"):
        return UserResponse(
            id="api_key_user",
            email=email,
            name="API Key User",
            api_key=current_user.api_key,
            created_at=datetime.utcnow(),
        )
    
    user = fake_users_db.get(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"],
    )


@router.post(
    "/api-keys",
    response_model=APIKeyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create API key",
    description="Generate a new API key for programmatic access.",
)
async def create_api_key(
    body: APIKeyCreate,
    current_user: TokenData = Depends(require_auth),
):
    """Create a new API key."""
    key_id = str(uuid.uuid4())
    api_key = f"df_{uuid.uuid4().hex}"  # df_ prefix for deepfake detector
    
    fake_api_keys_db[api_key] = {
        "id": key_id,
        "name": body.name,
        "key": api_key,
        "scopes": body.scopes,
        "user": current_user.sub,
        "created_at": datetime.utcnow(),
        "last_used": None,
        "is_active": True,
    }
    
    return APIKeyResponse(
        id=key_id,
        name=body.name,
        key=api_key,
        scopes=body.scopes,
        created_at=fake_api_keys_db[api_key]["created_at"],
    )


@router.get(
    "/api-keys",
    response_model=list[APIKeyResponse],
    summary="List API keys",
    description="List all API keys for the current user.",
)
async def list_api_keys(
    current_user: TokenData = Depends(require_auth),
):
    """List all API keys for the current user."""
    user_keys = [
        APIKeyResponse(
            id=key["id"],
            name=key["name"],
            key="..." + key["key"][-8:],  # Only show last 8 chars
            scopes=key["scopes"],
            created_at=key["created_at"],
            last_used=key["last_used"],
            is_active=key["is_active"],
        )
        for key in fake_api_keys_db.values()
        if key["user"] == current_user.sub
    ]
    
    return user_keys


@router.delete(
    "/api-keys/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke API key",
    description="Revoke an API key to prevent further access.",
)
async def revoke_api_key(
    key_id: str,
    current_user: TokenData = Depends(require_auth),
):
    """Revoke an API key."""
    # Find and deactivate the key
    for api_key, key_data in fake_api_keys_db.items():
        if key_data["id"] == key_id and key_data["user"] == current_user.sub:
            key_data["is_active"] = False
            return
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="API key not found",
    )
