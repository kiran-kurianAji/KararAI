from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.database import get_db
from app.models import Contract, User, Employer
from app.schemas import (
    ContractCreate, ContractUpdate, ContractResponse, ApiResponse, PaginatedResponse,
    ContractFilters, SearchQuery
)
from app.dependencies import get_current_user, get_current_worker, get_current_employer
from typing import Union

router = APIRouter()

@router.post("/", response_model=ApiResponse)
async def create_contract(
    contract: ContractCreate,
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Create a new contract (employers only)."""
    
    # Ensure the employer is creating the contract for themselves
    if contract.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create contract for another employer"
        )
    
    db_contract = Contract(
        title=contract.title,
        description=contract.description,
        employer_id=contract.employer_id,
        work_details=contract.work_details.dict(),
        payment=contract.payment.dict(),
        requirements=contract.requirements.dict()
    )
    
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    return ApiResponse(
        success=True,
        data=ContractResponse.from_orm(db_contract),
        message="Contract created successfully"
    )

@router.get("/", response_model=PaginatedResponse)
async def get_contracts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    employer_id: Optional[str] = Query(None),
    worker_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Union[User, Employer] = Depends(get_current_user)
):
    """Get contracts with filtering and pagination."""
    
    query = db.query(Contract)
    
    # Apply filters
    if status:
        query = query.filter(Contract.status == status)
    if employer_id:
        query = query.filter(Contract.employer_id == employer_id)
    if worker_id:
        query = query.filter(Contract.accepted_by == worker_id)
    
    # If user is a worker, show only their contracts or available ones
    if isinstance(current_user, User):
        query = query.filter(
            or_(
                Contract.accepted_by == current_user.id,
                Contract.status == "available"
            )
        )
    # If user is an employer, show only their contracts
    elif isinstance(current_user, Employer):
        query = query.filter(Contract.employer_id == current_user.id)
    
    # Pagination
    total = query.count()
    contracts = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[ContractResponse.from_orm(contract) for contract in contracts],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.get("/{contract_id}", response_model=ApiResponse)
async def get_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: Union[User, Employer] = Depends(get_current_user)
):
    """Get a specific contract by ID."""
    
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Check permissions
    if isinstance(current_user, User):
        if contract.accepted_by != current_user.id and contract.status != "available":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this contract"
            )
    elif isinstance(current_user, Employer):
        if contract.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this contract"
            )
    
    return ApiResponse(
        success=True,
        data=ContractResponse.from_orm(contract),
        message="Contract retrieved successfully"
    )

@router.put("/{contract_id}", response_model=ApiResponse)
async def update_contract(
    contract_id: str,
    contract_update: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: Employer = Depends(get_current_employer)
):
    """Update a contract (employers only)."""
    
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Check if employer owns this contract
    if contract.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this contract"
        )
    
    # Update fields
    update_data = contract_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contract, field, value)
    
    db.commit()
    db.refresh(contract)
    
    return ApiResponse(
        success=True,
        data=ContractResponse.from_orm(contract),
        message="Contract updated successfully"
    )

@router.post("/{contract_id}/accept", response_model=ApiResponse)
async def accept_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Accept a contract (workers only)."""
    
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    if contract.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contract is not available for acceptance"
        )
    
    if contract.accepted_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contract has already been accepted by another worker"
        )
    
    # Accept the contract
    contract.accepted_by = current_user.id
    contract.status = "accepted"
    
    # Initialize tracking
    contract.work_tracking = {
        "totalHoursWorked": 0,
        "daysWorked": 0,
        "estimatedTotalHours": 0
    }
    contract.payment_tracking = {
        "totalDue": 0,
        "totalReceived": 0,
        "pendingAmount": 0
    }
    
    db.commit()
    db.refresh(contract)
    
    return ApiResponse(
        success=True,
        data=ContractResponse.from_orm(contract),
        message="Contract accepted successfully"
    )

@router.post("/{contract_id}/cancel", response_model=ApiResponse)
async def cancel_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    current_user: Union[User, Employer] = Depends(get_current_user)
):
    """Cancel a contract."""
    
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Check permissions
    if isinstance(current_user, User):
        if contract.accepted_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this contract"
            )
    elif isinstance(current_user, Employer):
        if contract.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this contract"
            )
    
    if contract.status in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contract cannot be cancelled in its current state"
        )
    
    contract.status = "cancelled"
    db.commit()
    db.refresh(contract)
    
    return ApiResponse(
        success=True,
        data=ContractResponse.from_orm(contract),
        message="Contract cancelled successfully"
    )

@router.get("/search", response_model=PaginatedResponse)
async def search_contracts(
    keywords: str = Query(""),
    location_city: Optional[str] = Query(None),
    location_state: Optional[str] = Query(None),
    max_distance: Optional[int] = Query(None),
    min_rate: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    rate_type: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),  # comma-separated
    sort_by: str = Query("relevance"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Union[User, Employer] = Depends(get_current_user)
):
    """Search contracts with filters."""
    
    query = db.query(Contract).filter(Contract.status == "available")
    
    # Apply text search
    if keywords:
        query = query.filter(
            or_(
                Contract.title.contains(keywords),
                Contract.description.contains(keywords)
            )
        )
    
    # Apply location filters
    if location_city or location_state:
        # This would need more sophisticated JSON querying in production
        pass
    
    # Apply payment filters
    if min_rate or max_rate or rate_type:
        # This would need JSON querying for payment field
        pass
    
    # Apply skills filter
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        # This would need JSON array querying for requirements.skills
        pass
    
    # Apply sorting
    if sort_by == "date":
        if sort_order == "desc":
            query = query.order_by(Contract.created_at.desc())
        else:
            query = query.order_by(Contract.created_at.asc())
    elif sort_by == "payment":
        # Would need to sort by payment.rate
        pass
    else:  # relevance or default
        query = query.order_by(Contract.created_at.desc())
    
    # Pagination
    total = query.count()
    contracts = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[ContractResponse.from_orm(contract) for contract in contracts],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )