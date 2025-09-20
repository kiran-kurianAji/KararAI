from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.v1.api import api_router
import os

# Create FastAPI app
app = FastAPI(
    title="AI FairWork API",
    description="Empowering Contract & Informal Workers with AI",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    try:
        # Ensure data directory exists for SQLite
        if "sqlite" in settings.database_url:
            db_path = settings.database_url.replace("sqlite:///", "")
            db_dir = os.path.dirname(db_path)
            if db_dir and not os.path.exists(db_dir):
                os.makedirs(db_dir, exist_ok=True)
        
        # Create database tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified successfully!")
    except Exception as e:
        print(f"⚠️  Database startup warning: {e}")
        print("Continuing with server startup...")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "KararAI API - Legal Contract Assistant with Voice Support"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "KararAI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)