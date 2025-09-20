import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./fairwork.db"
    
    # JWT Settings
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Gemini AI
    gemini_api_key: Optional[str] = None
    
    # CORS - handle as comma-separated string
    allowed_origins_str: str = Field(default="http://localhost:5173,http://localhost:3000", alias="ALLOWED_ORIGINS")
    
    @property
    def allowed_origins(self) -> List[str]:
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in self.allowed_origins_str.split(",") if origin.strip()]
    
    class Config:
        env_file = ".env"

settings = Settings()