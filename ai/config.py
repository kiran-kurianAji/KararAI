"""
Configuration file for Multilingual AI Chatbot
Modify these settings to customize the chatbot behavior
"""

# Whisper Model Configuration
WHISPER_MODEL = "base"  # Options: tiny, base, small, medium, large
# tiny: Fastest, least accurate
# base: Good balance (recommended)
# small: Better accuracy, slower
# medium: High accuracy, much slower
# large: Best accuracy, very slow

# Audio Configuration
SAMPLE_RATE = 16000  # Audio sample rate for recording
MAX_RECORDING_DURATION = 10  # Maximum recording duration in seconds

# Language Configuration
DEFAULT_INPUT_LANGUAGE = "hi"  # Hindi
DEFAULT_OUTPUT_LANGUAGE = "hi"  # Hindi

# Supported languages mapping
LANGUAGE_MAPPING = {
    "Hindi": "hi",
    "English": "en",
    "Tamil": "ta",
    "Telugu": "te",
    "Bengali": "bn",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Marathi": "mr",
    "Punjabi": "pa"
}

# UI Configuration
WINDOW_TITLE = "Multilingual AI Chatbot"
WINDOW_SIZE = "800x600"
CHAT_HEIGHT = 15
INPUT_HEIGHT = 3

# AI Response Configuration
# Set to True to enable debug mode (shows translation steps)
DEBUG_MODE = False

# Placeholder responses (can be replaced with actual AI integration)
PLACEHOLDER_RESPONSES = [
    "I understand you said: '{message}'. This is a placeholder response. You can integrate this with a local LLM or free AI service.",
    "Thank you for your message: '{message}'. I'm a multilingual chatbot that can understand and respond in multiple languages.",
    "Your message '{message}' has been processed. I can help you with various tasks once you integrate a proper AI model.",
    "I received your message: '{message}'. The voice and translation features are working! You can now add your preferred AI model.",
    "Hello! I heard you say: '{message}'. I'm ready to help once you connect me to an AI model.",
    "Thanks for your input: '{message}'. The multilingual features are working perfectly!"
]

# TTS Configuration
TTS_SLOW = False  # Set to True for slower speech (useful for learning)
TTS_LANGUAGE_OVERRIDE = None  # Override TTS language (None for auto-detect)

# Translation Configuration
TRANSLATION_TIMEOUT = 10  # Timeout for translation requests in seconds
FALLBACK_TO_ORIGINAL = True  # Use original text if translation fails
