from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import verify_token, get_user_by_id, get_user_type
from app.models import User, Employer
from typing import Union

# Security scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Union[User, Employer]:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = verify_token(token, credentials_exception)
    
    user = get_user_by_id(db, user_id=token_data.id)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_worker(
    current_user: Union[User, Employer] = Depends(get_current_user)
) -> User:
    """Get the current authenticated worker."""
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as worker"
        )
    return current_user

async def get_current_employer(
    current_user: Union[User, Employer] = Depends(get_current_user)
) -> Employer:
    """Get the current authenticated employer."""
    if not isinstance(current_user, Employer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as employer"
        )
    return current_user

async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Union[User, Employer, None]:
    """Get the current user if authenticated, otherwise None."""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None