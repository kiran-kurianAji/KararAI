from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Base schemas
class LocationBase(BaseModel):
    state: str
    city: str
    pincode: str

class EmployerLocationBase(LocationBase):
    address: str

class PreferencesBase(BaseModel):
    max_travel_distance: int
    preferred_working_hours: List[str]
    minimum_wage: float

class ExperienceBase(BaseModel):
    years_of_experience: int
    previous_jobs: List[str]
    skills: List[str]

class WorkDetailsBase(BaseModel):
    location: Dict[str, Any]
    start_date: datetime
    end_date: Optional[datetime] = None
    duration: str
    working_hours: str

class PaymentBase(BaseModel):
    rate_type: str  # hourly, daily, weekly, monthly, fixed
    rate: float
    currency: str = "INR"
    payment_terms: str

class RequirementsBase(BaseModel):
    skills: List[str]
    experience: int
    tools: Optional[List[str]] = None

# User schemas
class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    digital_id: str
    area_of_expertise: List[str]
    location: LocationBase
    preferences: PreferencesBase
    experience: ExperienceBase

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    phone_or_email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    area_of_expertise: Optional[List[str]] = None
    location: Optional[LocationBase] = None
    preferences: Optional[PreferencesBase] = None
    experience: Optional[ExperienceBase] = None
    profile_picture: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_verified: bool
    profile_picture: Optional[str] = None
    rating: float
    completed_jobs: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Employer schemas
class EmployerBase(BaseModel):
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    business_id: str
    business_type: str
    location: EmployerLocationBase

class EmployerCreate(EmployerBase):
    password: str

class EmployerResponse(EmployerBase):
    id: str
    is_verified: bool
    rating: float
    posted_jobs: int
    completed_projects: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Contract schemas
class ContractBase(BaseModel):
    title: str
    description: str
    work_details: WorkDetailsBase
    payment: PaymentBase
    requirements: RequirementsBase

class ContractCreate(ContractBase):
    employer_id: str

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    work_details: Optional[Dict[str, Any]] = None
    payment: Optional[Dict[str, Any]] = None
    requirements: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ContractResponse(ContractBase):
    id: str
    employer_id: str
    status: str
    accepted_by: Optional[str] = None
    contract_receipt_id: Optional[str] = None
    fairness_score: float
    is_minimum_wage_compliant: bool
    applicants_count: int
    work_tracking: Optional[Dict[str, Any]] = None
    payment_tracking: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    employer: Optional[EmployerResponse] = None
    worker: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Job Post schemas
class JobPostBase(BaseModel):
    title: str
    description: str
    category: str
    work_details: Dict[str, Any]
    payment: Dict[str, Any]
    requirements: Dict[str, Any]

class JobPostCreate(JobPostBase):
    employer_id: str

class JobPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    work_details: Optional[Dict[str, Any]] = None
    payment: Optional[Dict[str, Any]] = None
    requirements: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class JobPostResponse(JobPostBase):
    id: str
    employer_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    employer: Optional[EmployerResponse] = None

    class Config:
        from_attributes = True

# Application schemas
class ContractApplicationBase(BaseModel):
    job_id: str
    worker_id: str
    worker_name: str
    message: Optional[str] = None
    proposed_wage: Optional[float] = None
    proposed_message: Optional[str] = None

class ContractApplicationCreate(ContractApplicationBase):
    original_wage: float
    worker_profile: Dict[str, Any]

class ContractApplicationUpdate(BaseModel):
    status: Optional[str] = None
    employer_response: Optional[str] = None
    contract_id_generated: Optional[str] = None

class ContractApplicationResponse(ContractApplicationBase):
    id: str
    status: str
    applied_at: datetime
    original_wage: float
    employer_response: Optional[str] = None
    contract_id_generated: Optional[str] = None
    worker_profile: Dict[str, Any]

    class Config:
        from_attributes = True

# Work Log schemas
class WorkLogBase(BaseModel):
    contract_id: str
    date: datetime
    hours_worked: float
    description: str

class WorkLogCreate(WorkLogBase):
    worker_id: str

class WorkLogUpdate(BaseModel):
    hours_worked: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None
    approved_by: Optional[str] = None

class WorkLogResponse(WorkLogBase):
    id: str
    worker_id: str
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Payment Record schemas
class PaymentRecordBase(BaseModel):
    contract_id: str
    amount: float
    payment_type: str
    payment_method: str
    due_date: datetime
    notes: Optional[str] = None

class PaymentRecordCreate(PaymentRecordBase):
    worker_id: str
    employer_id: str

class PaymentRecordUpdate(BaseModel):
    status: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_proof: Optional[str] = None
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None

class PaymentRecordResponse(PaymentRecordBase):
    id: str
    worker_id: str
    employer_id: str
    currency: str
    status: str
    transaction_id: Optional[str] = None
    payment_proof: Optional[str] = None
    paid_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Chat schemas
class ChatMessageBase(BaseModel):
    message: str
    message_type: str = "text"
    contract_id: Optional[str] = None

class ChatMessageCreate(ChatMessageBase):
    sender_id: str
    receiver_id: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: str
    sender_id: str
    receiver_id: Optional[str] = None
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    priority: str = "medium"
    action_url: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    id: Optional[str] = None

# API Response schemas
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None

class PaginatedResponse(BaseModel):
    success: bool
    data: List[Any]
    pagination: Dict[str, int]
    message: Optional[str] = None

# Search and Filter schemas
class ContractFilters(BaseModel):
    location: Optional[Dict[str, Any]] = None
    payment: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    duration: Optional[Dict[str, int]] = None
    working_hours: Optional[List[str]] = None
    employer_rating: Optional[float] = None
    fairness_score: Optional[float] = None

class SearchQuery(BaseModel):
    keywords: str = ""
    filters: Optional[ContractFilters] = None
    sort_by: str = "relevance"
    sort_order: str = "desc"
    page: int = 1
    limit: int = 20