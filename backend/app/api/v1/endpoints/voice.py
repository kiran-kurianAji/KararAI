from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
import tempfile
import os
import subprocess
import json
from app.database import get_db
from app.models import User
from app.dependencies import get_current_worker
from app.schemas import ApiResponse
from app.services.voice_service import voice_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/speech-to-text", response_model=ApiResponse)
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Form("hi"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Convert speech to text using Whisper."""
    
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Invalid audio file format")
    
    try:
        # Save uploaded audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Process audio with voice service
        result = await voice_service.speech_to_text(temp_audio_path, language)
        
        # Cleanup
        os.unlink(temp_audio_path)
        
        return ApiResponse(
            success=True,
            data={
                "text": result["text"],
                "language": result["language"],
                "confidence": result.get("confidence", 0.8)
            },
            message="Speech converted to text successfully"
        )
        
    except Exception as e:
        logger.error(f"Speech-to-text error for user {current_user.id}: {e}")
        
        # Cleanup on error
        if 'temp_audio_path' in locals():
            try:
                os.unlink(temp_audio_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500,
            detail="Speech recognition failed. Please try again or type your message."
        )

@router.post("/text-to-speech")
async def text_to_speech(
    text: str = Form(...),
    language: str = Form("hi"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_worker)
):
    """Convert text to speech using gTTS."""
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    if len(text) > 500:
        raise HTTPException(status_code=400, detail="Text is too long (max 500 characters)")
    
    try:
        # Generate speech using voice service
        audio_path = await voice_service.text_to_speech(text, language)
        
        # Read audio file and return as response
        with open(audio_path, 'rb') as audio_file:
            audio_content = audio_file.read()
        
        # Cleanup
        os.unlink(audio_path)
        
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3"
            }
        )
        
    except Exception as e:
        logger.error(f"Text-to-speech error for user {current_user.id}: {e}")
        
        # Cleanup on error
        if 'audio_path' in locals():
            try:
                os.unlink(audio_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500,
            detail="Speech generation failed. Please try again."
        )

@router.get("/test", response_model=ApiResponse)
async def test_voice_service():
    """Test voice service availability."""
    
    try:
        status = voice_service.get_service_status()
        return ApiResponse(
            success=True,
            data=status,
            message="Voice service status retrieved"
        )
    except Exception as e:
        logger.error(f"Voice service test error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Voice service test failed"
        )