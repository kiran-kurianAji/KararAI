#!/usr/bin/env python3
"""
Test script to verify audio recording and Whisper functionality
"""

import pyaudio
import numpy as np
import whisper
import time

def test_microphone():
    """Test if microphone is accessible"""
    print("Testing microphone access...")
    audio = pyaudio.PyAudio()
    
    try:
        # List available audio devices
        print("\nAvailable audio devices:")
        for i in range(audio.get_device_count()):
            device_info = audio.get_device_info_by_index(i)
            if device_info['maxInputChannels'] > 0:
                print(f"  {i}: {device_info['name']} (Channels: {device_info['maxInputChannels']})")
        
        # Test microphone access
        stream = audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=1024
        )
        
        print("\nRecording 3 seconds of audio for testing...")
        audio_data = []
        for _ in range(int(16000 / 1024 * 3)):  # 3 seconds
            data = stream.read(1024)
            audio_data.append(data)
            
            # Show audio level
            audio_np = np.frombuffer(data, dtype=np.int16)
            level = np.sqrt(np.mean(audio_np**2))
            print(f"Audio level: {level:6.0f}", end='\r')
        
        stream.stop_stream()
        stream.close()
        
        # Convert to numpy array
        audio_bytes = b''.join(audio_data)
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        print(f"\nAudio captured: {len(audio_np)} samples ({len(audio_np)/16000:.2f} seconds)")
        print(f"Audio range: {np.min(audio_np):.4f} to {np.max(audio_np):.4f}")
        print(f"Audio RMS: {np.sqrt(np.mean(audio_np**2)):.4f}")
        
        return audio_np
        
    except Exception as e:
        print(f"Microphone test failed: {e}")
        return None
    finally:
        audio.terminate()

def test_whisper(audio_data):
    """Test Whisper transcription"""
    if audio_data is None:
        print("No audio data to test")
        return
        
    print("\nTesting Whisper transcription...")
    
    try:
        # Load Whisper model
        print("Loading Whisper base model...")
        model = whisper.load_model("base")
        
        # Test with different language settings
        languages = ["en", "hi", None]  # None = auto-detect
        
        for lang in languages:
            print(f"\nTesting with language: {lang if lang else 'auto-detect'}")
            
            result = model.transcribe(
                audio_data,
                language=lang,
                fp16=False,
                verbose=True,
                temperature=0.0,
                compression_ratio_threshold=2.4,
                logprob_threshold=-1.0,
                no_speech_threshold=0.6
            )
            
            detected_lang = result.get("language", "unknown")
            text = result["text"].strip()
            
            print(f"  Detected language: {detected_lang}")
            print(f"  Transcribed text: '{text}'")
            print(f"  Text length: {len(text)} characters")
            
    except Exception as e:
        print(f"Whisper test failed: {e}")

def main():
    """Run audio tests"""
    print("=== Audio Recording and Whisper Test ===")
    print("This script will test your microphone and Whisper setup")
    print("Make sure your microphone is connected and working")
    
    input("\nPress Enter to start microphone test...")
    
    # Test microphone
    audio_data = test_microphone()
    
    if audio_data is not None:
        input("\nPress Enter to test Whisper transcription...")
        test_whisper(audio_data)
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main()