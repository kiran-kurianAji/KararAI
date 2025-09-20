#!/usr/bin/env python3
"""
Setup script for Multilingual AI Chatbot
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    
    packages = [
        "whisper",
        "googletrans==4.0.0-rc1", 
        "gtts",
        "sounddevice",
        "scipy",
        "numpy",
        "pygame"
    ]
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")
            return False
    
    print("\nAll packages installed successfully!")
    return True

def check_audio_system():
    """Check if audio system is working"""
    print("\nChecking audio system...")
    
    try:
        import sounddevice as sd
        devices = sd.query_devices()
        print(f"✓ Found {len(devices)} audio devices")
        
        # Test default device
        default_device = sd.default.device
        print(f"✓ Default input device: {default_device[0]}")
        print(f"✓ Default output device: {default_device[1]}")
        
        return True
    except Exception as e:
        print(f"✗ Audio system check failed: {e}")
        return False

def download_whisper_model():
    """Download Whisper model"""
    print("\nDownloading Whisper model...")
    
    try:
        import whisper
        print("Downloading 'base' model (this may take a few minutes)...")
        model = whisper.load_model("base")
        print("✓ Whisper model downloaded successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to download Whisper model: {e}")
        return False

def main():
    """Main setup function"""
    print("=== Multilingual AI Chatbot Setup ===\n")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8 or higher is required")
        return False
    
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install requirements
    if not install_requirements():
        print("Setup failed during package installation")
        return False
    
    # Check audio system
    if not check_audio_system():
        print("Warning: Audio system check failed. Voice features may not work properly.")
    
    # Download Whisper model
    if not download_whisper_model():
        print("Warning: Whisper model download failed. Speech-to-text may not work.")
    
    print("\n=== Setup Complete ===")
    print("You can now run the chatbot with: python multilingual_chatbot.py")
    print("\nNote: Make sure your microphone is working and you have internet connection for translation services.")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
