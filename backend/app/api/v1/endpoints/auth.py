from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User, Employer
from app.schemas import (
    UserCreate, UserLogin, UserResponse, EmployerCreate, EmployerResponse,
    Token, ApiResponse
)
from app.auth import (
    authenticate_user, create_access_token, get_password_hash, get_user_type
)
from app.dependencies import get_current_user
from typing import Union

router = APIRouter()

@router.post("/register/worker", response_model=ApiResponse)
async def register_worker(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new worker."""
    
    # Check if user already exists
    existing_user = None
    if user.email:
        existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user and user.phone:
        existing_user = db.query(User).filter(User.phone == user.phone).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user
    db_user = User(
        name=user.name,
        phone=user.phone,
        email=user.email,
        password_hash=hashed_password,
        digital_id=user.digital_id,
        area_of_expertise=user.area_of_expertise,
        location=user.location.dict(),
        preferences=user.preferences.dict(),
        experience=user.experience.dict()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return ApiResponse(
        success=True,
        data=UserResponse.from_orm(db_user),
        message="Worker registered successfully"
    )

@router.post("/register/employer", response_model=ApiResponse)
async def register_employer(employer: EmployerCreate, db: Session = Depends(get_db)):
    """Register a new employer."""
    
    # Check if employer already exists
    existing_employer = None
    if employer.email:
        existing_employer = db.query(Employer).filter(Employer.email == employer.email).first()
    if not existing_employer and employer.phone:
        existing_employer = db.query(Employer).filter(Employer.phone == employer.phone).first()
    
    if existing_employer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employer with this email or phone already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(employer.password)
    
    # Create employer
    db_employer = Employer(
        name=employer.name,
        company=employer.company,
        phone=employer.phone,
        email=employer.email,
        password_hash=hashed_password,
        business_id=employer.business_id,
        business_type=employer.business_type,
        location=employer.location.dict()
    )
    
    db.add(db_employer)
    db.commit()
    db.refresh(db_employer)
    
    return ApiResponse(
        success=True,
        data=EmployerResponse.from_orm(db_employer),
        message="Employer registered successfully"
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login for both workers and employers."""
    
    user = authenticate_user(db, user_credentials.phone_or_email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(days=7)  # 7 days instead of 30 minutes
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    user_type = get_user_type(user)
    user_data = UserResponse.from_orm(user) if user_type == "worker" else EmployerResponse.from_orm(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user_type,
        "user": user_data.dict()
    }

@router.get("/me", response_model=ApiResponse)
async def get_current_user_info(current_user: Union[User, Employer] = Depends(get_current_user)):
    """Get current user information."""
    
    user_type = get_user_type(current_user)
    user_data = UserResponse.from_orm(current_user) if user_type == "worker" else EmployerResponse.from_orm(current_user)
    
    return ApiResponse(
        success=True,
        data={
            "user": user_data.dict(),
            "user_type": user_type
        },
        message="User information retrieved successfully"
    )

@router.post("/logout", response_model=ApiResponse)
async def logout(current_user: Union[User, Employer] = Depends(get_current_user)):
    """Logout user (client should remove token)."""
    return ApiResponse(
        success=True,
        message="Logged out successfully"
    )