"""
Voice service for speech-to-text and text-to-speech functionality
Integrates with the AI folder's multilingual capabilities using exact methods
"""

import os
import sys
import tempfile
import subprocess
import json
import numpy as np
import io
import wave
from typing import Dict, Any, Optional, Union
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class VoiceService:
    """Service for handling voice-related operations using AI folder methods."""
    
    def __init__(self):
        # Path to AI folder containing the voice processing scripts
        self.ai_folder_path = Path(__file__).parent.parent.parent.parent / "ai"
        self.whisper_model = None
        self.translator = None
        self.recognizer = None
        self.initialization_error = None
        
        # Initialize components with error handling
        self._initialize_components()
        
    def _initialize_components(self):
        """Initialize Speech Recognition and translator with graceful fallback."""
        self.whisper_model = None  # Not using Whisper
        self.recognizer = None
        self.translator = None
        self.initialization_error = None
        
        # Initialize Speech Recognition (Google)
        try:
            import speech_recognition as sr
            self.recognizer = sr.Recognizer()
            logger.info("Google Speech Recognition initialized successfully")
        except ImportError as e:
            logger.warning(f"SpeechRecognition not available: {e}")
            self.initialization_error = f"SpeechRecognition not available: {e}"
        except Exception as e:
            logger.warning(f"Failed to initialize speech recognition: {e}")
            self.initialization_error = f"Speech recognition failed: {e}"
        
        # Initialize Translator
        try:
            # Try deep-translator first (more compatible)
            try:
                from deep_translator import GoogleTranslator
                self.translator = GoogleTranslator(source='auto', target='en')
                logger.info("Deep Translator initialized successfully")
            except Exception as e:
                logger.warning(f"Deep Translator failed: {e}, trying googletrans fallback")
                try:
                    from googletrans import Translator
                    self.translator = Translator()
                    logger.info("Google Translator fallback initialized successfully")
                except Exception as e2:
                    logger.warning(f"Google Translator fallback also failed: {e2}")
                    self.translator = None
        except Exception as e:
            logger.warning(f"Translation service initialization failed: {e}")
            self.translator = None
        
        # Log overall status
        if self.recognizer:
            logger.info("Voice service initialized successfully (Google Speech Recognition)")
        else:
            logger.warning("Voice service initialization failed - Speech Recognition not available")
            self.initialization_error = "Speech Recognition not available"
    
    def _translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Helper method to translate text using available translator.
        """
        if not self.translator:
            return text
            
        try:
            # Check if using deep-translator
            if hasattr(self.translator, 'translate') and not hasattr(self.translator, 'client'):
                # deep-translator GoogleTranslator
                from deep_translator import GoogleTranslator
                if source_lang == 'hi' and target_lang == 'en':
                    translator = GoogleTranslator(source='hi', target='en')
                    return translator.translate(text)
                elif source_lang == 'en' and target_lang == 'hi':
                    translator = GoogleTranslator(source='en', target='hi')
                    return translator.translate(text)
                else:
                    return text
            else:
                # googletrans fallback
                translation = self.translator.translate(text, src=source_lang, dest=target_lang)
                return translation.text
        except Exception as e:
            logger.warning(f"Translation failed: {e}")
            return text
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get the status of voice service components."""
        return {
            "speech_recognition_available": self.recognizer is not None,
            "translator_available": self.translator is not None,
            "gtts_available": True,  # Assume gTTS is available since it's simpler
            "ai_folder_path": str(self.ai_folder_path),
            "ai_folder_exists": self.ai_folder_path.exists(),
            "initialization_error": self.initialization_error,
            "service_type": "google_only"
        }
    
    def preprocess_audio(self, audio_data: bytes, sample_rate: int = 16000) -> np.ndarray:
        """
        Preprocess audio data for better recognition (from AI folder).
        Applies noise reduction, normalization, and filtering.
        """
        try:
            from scipy import signal
            from scipy.signal import butter, filtfilt
            
            # Convert bytes to numpy array
            if isinstance(audio_data, bytes):
                audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            else:
                audio_np = audio_data
            
            # Apply preprocessing steps from AI folder
            
            # 1. Noise gate - remove very quiet sections
            noise_threshold = 0.01
            audio_np[np.abs(audio_np) < noise_threshold] *= 0.1
            
            # 2. Normalize audio
            if np.max(np.abs(audio_np)) > 0:
                audio_np = audio_np / np.max(np.abs(audio_np)) * 0.8
            
            # 3. Apply bandpass filter (80Hz to 8000Hz for speech)
            if sample_rate >= 16000:
                nyquist = sample_rate / 2
                low_cutoff = 80 / nyquist
                high_cutoff = min(8000 / nyquist, 0.95)
                
                try:
                    b, a = butter(4, [low_cutoff, high_cutoff], btype='band')
                    audio_np = filtfilt(b, a, audio_np)
                except:
                    pass  # Skip filtering if it fails
            
            # 4. Remove silence from beginning and end
            # Find first and last non-silent samples
            silence_threshold = 0.005
            non_silent = np.where(np.abs(audio_np) > silence_threshold)[0]
            
            if len(non_silent) > 0:
                start_idx = max(0, non_silent[0] - int(0.1 * sample_rate))  # Keep 0.1s before
                end_idx = min(len(audio_np), non_silent[-1] + int(0.1 * sample_rate))  # Keep 0.1s after
                audio_np = audio_np[start_idx:end_idx]
            
            return audio_np
            
        except Exception as e:
            logger.warning(f"Audio preprocessing failed: {e}, using original audio")
            # Fallback to basic normalization
            if isinstance(audio_data, bytes):
                audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            else:
                audio_np = audio_data
            
            if np.max(np.abs(audio_np)) > 0:
                audio_np = audio_np / np.max(np.abs(audio_np)) * 0.8
            
            return audio_np

    async def speech_to_text(self, audio_file_path: str, language: str = "hi") -> Dict[str, Any]:
        """
        Convert speech to text using Google Speech Recognition only.
        Simple and reliable approach without Whisper complexity.
        """
        # Check if speech recognition is available
        if not self.recognizer:
            raise Exception("Speech recognition service not available. Please check if SpeechRecognition is installed.")
        
        try:
            # Read audio file
            with wave.open(audio_file_path, 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
                audio_data = wav_file.readframes(wav_file.getnframes())
            
            # Preprocess audio (basic normalization)
            audio_np = self.preprocess_audio(audio_data, sample_rate)
            audio_duration = len(audio_np) / sample_rate
            
            logger.info(f"Processing {audio_duration:.2f}s of audio in {language}")
            
            # Convert numpy array back to audio for Google Speech Recognition
            audio_int16 = (audio_np * 32767).astype(np.int16)
            audio_bytes = audio_int16.tobytes()
            
            # Create AudioData for speech_recognition
            import speech_recognition as sr
            audio_data_sr = sr.AudioData(audio_bytes, sample_rate, 2)
            
            # Use Google Speech Recognition
            if language == "hi":
                # For Hindi input
                text = self.recognizer.recognize_google(audio_data_sr, language='hi-IN')
                if text and len(text.strip()) > 0:
                    # Translate to English for AI processing
                    english_text = self._translate_text(text, 'hi', 'en')
                    
                    return {
                        "text": english_text,
                        "original_text": text,
                        "language": "hi",
                        "confidence": 0.9,
                        "method": "google_sr_hindi"
                    }
            else:
                # For English input
                text = self.recognizer.recognize_google(audio_data_sr, language='en-US')
                if text and len(text.strip()) > 0:
                    return {
                        "text": text,
                        "original_text": text,
                        "language": "en",
                        "confidence": 0.9,
                        "method": "google_sr_english"
                    }
            
            # If we get here, no text was recognized
            raise Exception("No speech detected in audio")
                
        except sr.UnknownValueError:
            logger.warning("Google Speech Recognition could not understand audio")
            raise Exception("Could not understand the audio. Please speak more clearly.")
        except sr.RequestError as e:
            logger.error(f"Google Speech Recognition service error: {e}")
            raise Exception("Speech recognition service temporarily unavailable. Please try again.")
        except Exception as e:
            logger.error(f"Speech-to-text processing failed: {e}")
            raise Exception(f"Audio processing failed: {str(e)}")
    
    async def text_to_speech(self, text: str, language: str = "hi") -> str:
        """
        Convert text to speech using the exact method from AI folder.
        """
        try:
            from gtts import gTTS
            
            # Translate to target language if needed and translator is available
            target_text = text
            if language == "hi":
                target_text = self._translate_text(text, 'en', 'hi')
                logger.info(f"Translated to Hindi: {target_text}")
            
            # Generate speech
            tts = gTTS(
                text=target_text,
                lang=language,
                slow=False
            )
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                tts.save(temp_file.name)
                logger.info(f"Generated TTS audio: {temp_file.name}")
                return temp_file.name
                
        except Exception as e:
            logger.error(f"Text-to-speech failed: {e}")
            raise Exception(f"Speech generation failed: {str(e)}")

# Singleton instance
voice_service = VoiceService()