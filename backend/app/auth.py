from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.config import settings
from app.models import User, Employer
from app.schemas import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str, credentials_exception) -> TokenData:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id)
        return token_data
    except JWTError:
        raise credentials_exception

def authenticate_user(db: Session, phone_or_email: str, password: str) -> Union[User, Employer, None]:
    """Authenticate a user (worker or employer) by phone/email and password."""
    
    # Try to find user first
    user = None
    if "@" in phone_or_email:
        # Email
        user = db.query(User).filter(User.email == phone_or_email).first()
        if not user:
            user = db.query(Employer).filter(Employer.email == phone_or_email).first()
    else:
        # Phone
        user = db.query(User).filter(User.phone == phone_or_email).first()
        if not user:
            user = db.query(Employer).filter(Employer.phone == phone_or_email).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user

def get_user_by_id(db: Session, user_id: str) -> Union[User, Employer, None]:
    """Get user (worker or employer) by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(Employer).filter(Employer.id == user_id).first()
    return user

def get_user_type(user: Union[User, Employer]) -> str:
    """Get the type of user (worker or employer)."""
    return "worker" if isinstance(user, User) else "employer"