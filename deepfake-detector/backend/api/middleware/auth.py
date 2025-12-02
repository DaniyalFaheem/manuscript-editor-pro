"""
Authentication middleware for JWT and API key validation.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from jose import JWTError, jwt
from passlib.context import CryptContext

from api.schemas import TokenData
from config.settings import settings


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security schemes
bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name=settings.API_KEY_HEADER, auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        sub: str = payload.get("sub")
        exp: datetime = datetime.fromtimestamp(payload.get("exp"))
        
        if sub is None:
            return None
        
        return TokenData(
            sub=sub,
            exp=exp,
            api_key=payload.get("api_key"),
            scopes=payload.get("scopes", [])
        )
    except JWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> Optional[TokenData]:
    """
    Get the current user from JWT token or API key.
    Returns None if no authentication is provided (for optional auth endpoints).
    """
    # Try JWT token first
    if credentials:
        token_data = decode_token(credentials.credentials)
        if token_data:
            return token_data
    
    # Try API key
    if api_key:
        # SECURITY NOTE: In production, this should validate the API key
        # against a database or secure store. The current implementation
        # accepts any key with the correct prefix for demonstration purposes.
        # 
        # Production implementation should:
        # 1. Query database for the API key
        # 2. Check if key is active and not expired
        # 3. Load associated scopes from the database
        # 4. Rate limit based on key-specific limits
        
        # Basic validation: check key format
        if not api_key.startswith("df_") or len(api_key) < 10:
            return None
        
        return TokenData(
            sub=f"api_key:{api_key}",
            exp=datetime.utcnow() + timedelta(hours=1),
            api_key=api_key,
            scopes=["analyze", "results"]
        )
    
    return None


async def require_auth(
    user: Optional[TokenData] = Depends(get_current_user)
) -> TokenData:
    """Require authentication for an endpoint."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_scope(required_scopes: list[str]):
    """Factory to create a dependency that requires specific scopes."""
    async def check_scopes(user: TokenData = Depends(require_auth)) -> TokenData:
        for scope in required_scopes:
            if scope not in user.scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required scope: {scope}",
                )
        return user
    return check_scopes


class AuthMiddleware:
    """
    Optional authentication middleware.
    Can be used as a dependency when authentication is optional.
    """
    
    def __init__(self, required: bool = True, scopes: list[str] | None = None):
        self.required = required
        self.scopes = scopes or []
    
    async def __call__(
        self,
        request: Request,
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
        api_key: Optional[str] = Depends(api_key_header),
    ) -> Optional[TokenData]:
        """Check authentication and return user data."""
        user = await get_current_user(credentials, api_key)
        
        if self.required and not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if user and self.scopes:
            for scope in self.scopes:
                if scope not in user.scopes:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Missing required scope: {scope}",
                    )
        
        return user
