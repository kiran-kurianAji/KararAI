from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.database import get_db
from app.models import JobPost, ContractApplication, User, Employer
from app.schemas import (
    JobPostCreate, JobPostUpdate, JobPostResponse, ApiResponse, PaginatedResponse,
    ContractApplicationCreate, ContractApplicationUpdate, ContractApplicationResponse
)
from app.dependencies import get_current_user, get_current_worker, get_current_employer
from typing import Union

router = APIRouter()

@router.post("/", response_model=ApiResponse)
async def create_job_post(
    job_post: JobPostCreate,
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Create a new job post (employers only)."""
    
    # Ensure the employer is creating the job for themselves
    if job_post.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create job post for another employer"
        )
    
    db_job_post = JobPost(
        employer_id=job_post.employer_id,
        title=job_post.title,
        description=job_post.description,
        category=job_post.category,
        work_details=job_post.work_details,
        payment=job_post.payment,
        requirements=job_post.requirements
    )
    
    db.add(db_job_post)
    db.commit()
    db.refresh(db_job_post)
    
    return ApiResponse(
        success=True,
        data=JobPostResponse.from_orm(db_job_post),
        message="Job post created successfully"
    )

@router.get("/", response_model=PaginatedResponse)
async def get_job_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    employer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Union[User, Employer] = Depends(get_current_user)
):
    """Get job posts with filtering and pagination."""
    
    query = db.query(JobPost)
    
    # Apply filters
    if status:
        query = query.filter(JobPost.status == status)
    if category:
        query = query.filter(JobPost.category == category)
    if employer_id:
        query = query.filter(JobPost.employer_id == employer_id)
    
    # If user is a worker, show only published jobs
    if isinstance(current_user, User):
        query = query.filter(JobPost.status == "published")
    # If user is an employer, show only their jobs
    elif isinstance(current_user, Employer):
        query = query.filter(JobPost.employer_id == current_user.id)
    
    # Pagination
    total = query.count()
    job_posts = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[JobPostResponse.from_orm(job_post) for job_post in job_posts],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.get("/{job_id}", response_model=ApiResponse)
async def get_job_post(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: Union[User, Employer] = Depends(get_current_user)
):
    """Get a specific job post by ID."""
    
    job_post = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found"
        )
    
    # Check permissions
    if isinstance(current_user, User):
        if job_post.status != "published":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Job post is not published"
            )
    elif isinstance(current_user, Employer):
        if job_post.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this job post"
            )
    
    return ApiResponse(
        success=True,
        data=JobPostResponse.from_orm(job_post),
        message="Job post retrieved successfully"
    )

@router.put("/{job_id}", response_model=ApiResponse)
async def update_job_post(
    job_id: str,
    job_update: JobPostUpdate,
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Update a job post (employers only)."""
    
    job_post = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found"
        )
    
    # Check if employer owns this job post
    if job_post.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job post"
        )
    
    # Update fields
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job_post, field, value)
    
    db.commit()
    db.refresh(job_post)
    
    return ApiResponse(
        success=True,
        data=JobPostResponse.from_orm(job_post),
        message="Job post updated successfully"
    )

@router.delete("/{job_id}", response_model=ApiResponse)
async def delete_job_post(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Delete a job post (employers only)."""
    
    job_post = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found"
        )
    
    # Check if employer owns this job post
    if job_post.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job post"
        )
    
    db.delete(job_post)
    db.commit()
    
    return ApiResponse(
        success=True,
        message="Job post deleted successfully"
    )

# Application endpoints
@router.post("/{job_id}/apply", response_model=ApiResponse)
async def apply_to_job(
    job_id: str,
    application: ContractApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Apply to a job post (workers only)."""
    
    job_post = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found"
        )
    
    if job_post.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job post is not available for applications"
        )
    
    # Check if worker already applied
    existing_application = db.query(ContractApplication).filter(
        and_(
            ContractApplication.job_id == job_id,
            ContractApplication.worker_id == current_user.id
        )
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Ensure the application is for the current user
    if application.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot apply on behalf of another worker"
        )
    
    db_application = ContractApplication(
        job_id=job_id,
        worker_id=application.worker_id,
        worker_name=application.worker_name,
        message=application.message,
        proposed_wage=application.proposed_wage,
        original_wage=application.original_wage,
        proposed_message=application.proposed_message,
        worker_profile=application.worker_profile
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return ApiResponse(
        success=True,
        data=ContractApplicationResponse.from_orm(db_application),
        message="Application submitted successfully"
    )

@router.get("/{job_id}/applications", response_model=PaginatedResponse)
async def get_job_applications(
    job_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Get applications for a job post (employers only)."""
    
    job_post = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found"
        )
    
    # Check if employer owns this job post
    if job_post.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view applications for this job"
        )
    
    query = db.query(ContractApplication).filter(ContractApplication.job_id == job_id)
    
    if status:
        query = query.filter(ContractApplication.status == status)
    
    # Pagination
    total = query.count()
    applications = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[ContractApplicationResponse.from_orm(app) for app in applications],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.put("/applications/{application_id}", response_model=ApiResponse)
async def update_application(
    application_id: str,
    application_update: ContractApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Update an application status (employers only)."""
    
    application = db.query(ContractApplication).filter(ContractApplication.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check if employer owns the job post
    job_post = db.query(JobPost).filter(JobPost.id == application.job_id).first()
    if not job_post or job_post.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this application"
        )
    
    # Update fields
    update_data = application_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    
    return ApiResponse(
        success=True,
        data=ContractApplicationResponse.from_orm(application),
        message="Application updated successfully"
    )