from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import ChatMessage, User, Contract
from app.schemas import (
    ChatMessageCreate, ChatMessageResponse, ApiResponse, PaginatedResponse
)
from app.dependencies import get_current_user, get_current_worker
from app.services.gemini_service import gemini_service
import re

router = APIRouter()

@router.post("/", response_model=ApiResponse)
async def send_chat_message(
    message: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Send a chat message to AI assistant."""
    
    # Ensure the message is from the current user
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot send message on behalf of another user"
        )
    
    # Save user message
    user_message = ChatMessage(
        sender_id=message.sender_id,
        receiver_id=message.receiver_id,
        message=message.message,
        message_type=message.message_type,
        contract_id=message.contract_id
    )
    
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Generate AI response
    ai_response_text = await generate_ai_response(message.message, current_user, message.contract_id, db)
    
    # Save AI response
    ai_message = ChatMessage(
        sender_id="ai-assistant",
        receiver_id=current_user.id,
        message=ai_response_text,
        message_type="text",
        contract_id=message.contract_id
    )
    
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    return ApiResponse(
        success=True,
        data={
            "user_message": ChatMessageResponse.from_orm(user_message),
            "ai_response": ChatMessageResponse.from_orm(ai_message)
        },
        message="Messages sent and received successfully"
    )

@router.get("/", response_model=PaginatedResponse)
async def get_chat_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    contract_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Get chat messages for the current user."""
    
    query = db.query(ChatMessage).filter(
        ChatMessage.sender_id == current_user.id
    )
    
    if contract_id:
        query = query.filter(ChatMessage.contract_id == contract_id)
    
    query = query.order_by(ChatMessage.timestamp.desc())
    
    # Pagination
    total = query.count()
    messages = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[ChatMessageResponse.from_orm(message) for message in messages],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

@router.get("/conversation", response_model=PaginatedResponse)
async def get_conversation(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    contract_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Get conversation (both user and AI messages) for the current user."""
    
    query = db.query(ChatMessage).filter(
        (ChatMessage.sender_id == current_user.id) |
        (ChatMessage.receiver_id == current_user.id)
    )
    
    if contract_id:
        query = query.filter(ChatMessage.contract_id == contract_id)
    
    query = query.order_by(ChatMessage.timestamp.asc())
    
    # Pagination
    total = query.count()
    messages = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        success=True,
        data=[ChatMessageResponse.from_orm(message) for message in messages],
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    )

async def generate_ai_response(
    user_message: str, 
    user: User, 
    contract_id: Optional[str], 
    db: Session
) -> str:
    """Generate AI response based on user message and context."""
    
    # Prepare user data for AI
    user_data = {
        "name": user.name,
        "area_of_expertise": user.area_of_expertise,
        "location": user.location,
        "preferences": user.preferences,
        "experience": user.experience
    }
    
    # Detect intent from user message
    message_lower = user_message.lower()
    
    # Job-related keywords
    job_keywords = [
        "job", "work", "employment", "opportunity", "hiring", "looking for work",
        "find job", "job search", "employment opportunity", "work available",
        "jobs near me", "construction work", "carpenter", "plumber", "electrician"
    ]
    
    # Rights-related keywords
    rights_keywords = [
        "rights", "law", "legal", "minimum wage", "payment", "salary", "wage",
        "government scheme", "subsidy", "mgnrega", "esi", "pf", "provident fund",
        "labor law", "working hours", "overtime", "safety", "compensation",
        "dispute", "complaint", "exploitation", "unfair"
    ]
    
    # Contract analysis keywords
    contract_keywords = [
        "contract", "agreement", "terms", "conditions", "fair", "analyze",
        "understand", "explain", "review"
    ]
    
    try:
        # Check if user is asking about a specific contract
        if contract_id and any(keyword in message_lower for keyword in contract_keywords):
            contract = db.query(Contract).filter(Contract.id == contract_id).first()
            if contract:
                contract_data = {
                    "title": contract.title,
                    "description": contract.description,
                    "payment": contract.payment,
                    "work_details": contract.work_details
                }
                return await gemini_service.analyze_contract_terms(contract_data, user_data)
        
        # Check for job-related queries
        elif any(keyword in message_lower for keyword in job_keywords):
            return await gemini_service.get_job_recommendations(user_data, user_message)
        
        # Check for rights-related queries
        elif any(keyword in message_lower for keyword in rights_keywords):
            return await gemini_service.get_rights_assistance(user_data, user_message)
        
        # General assistance
        else:
            return await gemini_service.general_assistance(user_data, user_message)
            
    except Exception as e:
        # Fallback response
        return f"""I'm here to help you with your work-related questions! I can assist you with:

📋 **Job Search & Opportunities**
- Finding suitable jobs based on your skills
- Job recommendations in your area
- Understanding job requirements

⚖️ **Worker Rights & Legal Information**
- Minimum wage laws in your state
- Government welfare schemes (MGNREGA, ESI, PF)
- Labor law protections
- How to file complaints

📄 **Contract Analysis**
- Understanding job terms and conditions
- Fair wage assessment
- Identifying contract red flags

💼 **Work Management**
- Logging work hours
- Payment tracking
- Career guidance

What would you like to know more about?"""

@router.post("/mark-read", response_model=ApiResponse)
async def mark_messages_read(
    message_ids: List[str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Mark messages as read."""
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.id.in_(message_ids),
        ChatMessage.receiver_id == current_user.id
    ).all()
    
    for message in messages:
        message.is_read = True
    
    db.commit()
    
    return ApiResponse(
        success=True,
        message=f"Marked {len(messages)} messages as read"
    )