from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import ChatMessage, User, Contract
from app.schemas import (
    ChatMessageCreate, ChatMessageResponse, ApiResponse, PaginatedResponse, JobAnalysisChatCreate
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
    
    print(f"=== CHAT DEBUG ===")
    print(f"Received message: {message}")
    print(f"Current user: {current_user.id if current_user else 'None'}")
    print(f"Message sender_id: {message.sender_id}")
    print(f"Message content: {message.message}")
    print(f"==================")
    
    # Ensure the message is from the current user
    if message.sender_id != current_user.id:
        print(f"ERROR: Sender ID mismatch. Message sender: {message.sender_id}, Current user: {current_user.id}")
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
    user_data = {
        "name": current_user.name,
        "area_of_expertise": current_user.area_of_expertise,
        "location": current_user.location,
        "preferences": current_user.preferences,
        "experience": current_user.experience
    }
    
    try:
        ai_response_text = await gemini_service.general_assistance(user_data, message.message)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        ai_response_text = "I'm having trouble connecting to the AI service right now. Please try again in a moment."
    
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

@router.post("/job-analysis", response_model=ApiResponse)
async def send_job_analysis_message(
    message: JobAnalysisChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Send a chat message for job analysis with job and user context."""
    
    print(f"=== JOB ANALYSIS CHAT DEBUG ===")
    print(f"Received message: {message}")
    print(f"Current user: {current_user.id if current_user else 'None'}")
    print(f"Job data provided: {message.job_data is not None}")
    print(f"User data provided: {message.user_data is not None}")
    print(f"================================")
    
    # Ensure the message is from the current user
    if message.sender_id != current_user.id:
        print(f"ERROR: Sender ID mismatch. Message sender: {message.sender_id}, Current user: {current_user.id}")
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
    
    # Prepare user data (use provided data or fetch from current user)
    user_data = message.user_data or {
        "id": current_user.id,
        "name": current_user.name,
        "area_of_expertise": current_user.area_of_expertise,
        "location": current_user.location,
        "preferences": current_user.preferences,
        "experience": current_user.experience
    }
    
    # Generate AI response using job analysis
    try:
        if message.job_data:
            # Use specialized job analysis if job data is provided
            ai_response_text = await gemini_service.analyze_job_opportunity(
                message.job_data, 
                user_data, 
                message.message
            )
        else:
            # Fall back to general assistance if no job data
            ai_response_text = await gemini_service.general_assistance(user_data, message.message)
            
    except Exception as e:
        print(f"Gemini API Error: {e}")
        ai_response_text = "I'm having trouble analyzing this job opportunity right now. Please try again in a moment."
    
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
        message="Job analysis completed successfully"
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
        print(f"Gemini AI Error: {e}")
        # Simple fallback responses instead of generic error
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good evening']):
            return f"Hello {user.name}! 👋 I'm your AI assistant. I can help you with job search, understanding your rights, contract analysis, and work logging. What would you like to know about?"
        
        elif any(word in message_lower for word in ['job', 'work', 'employment']):
            return f"I can help you find suitable jobs! Based on your expertise in {', '.join(user.area_of_expertise)}, I can recommend opportunities in your area. Would you like me to help you search for jobs or review contract terms?"
        
        elif any(word in message_lower for word in ['payment', 'money', 'salary', 'wage']):
            return f"For payment tracking and wage information:\n\n• Check if jobs meet minimum wage requirements\n• Track your payments and work hours\n• Understand your payment rights\n• Get help with payment disputes\n\nWhat specific payment question do you have?"
        
        elif any(word in message_lower for word in ['rights', 'legal', 'law']):
            return f"Your worker rights include:\n\n• Fair wages and timely payments\n• Safe working conditions\n• Right to file complaints\n• Access to government schemes\n\nI can provide specific information about labor laws in {user.location.get('state', 'your state')}. What would you like to know?"
        
        else:
            return f"Thanks for your message! I'm here to help with:\n\n🔍 **Job Search** - Find work opportunities\n⚖️ **Worker Rights** - Know your legal protections\n💰 **Payment Tracking** - Monitor wages and payments\n📋 **Contract Help** - Understand job terms\n\nWhat can I assist you with today?"

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