from fastapi import APIRouter
from app.api.v1.endpoints import auth, contracts, jobs, chat, voice

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Posts"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat Assistant"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Features"])