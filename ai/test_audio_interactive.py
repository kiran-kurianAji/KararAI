#!/usr/bin/env python3
"""
Interactive audio test - record and analyze audio quality
"""

import pyaudio
import numpy as np
import whisper
import time
import wave

def record_with_feedback():
    """Record audio with real-time feedback"""
    print("=== Interactive Audio Recording Test ===")
    print("This will help diagnose audio issues")
    
    audio = pyaudio.PyAudio()
    
    try:
        # List available devices
        print("\nAvailable microphones:")
        default_device = audio.get_default_input_device_info()
        print(f"Default device: {default_device['name']}")
        
        for i in range(audio.get_device_count()):
            device_info = audio.get_device_info_by_index(i)
            if device_info['maxInputChannels'] > 0:
                marker = " [DEFAULT]" if i == default_device['index'] else ""
                print(f"  {i}: {device_info['name']}{marker}")
        
        # Use default device
        device_index = default_device['index']
        
        # Test different recording parameters
        sample_rates = [16000, 44100]
        chunk_sizes = [1024, 2048]
        
        for sample_rate in sample_rates:
            for chunk_size in chunk_sizes:
                print(f"\n--- Testing: {sample_rate}Hz, chunk={chunk_size} ---")
                
                try:
                    stream = audio.open(
                        format=pyaudio.paInt16,
                        channels=1,
                        rate=sample_rate,
                        input=True,
                        input_device_index=device_index,
                        frames_per_buffer=chunk_size
                    )
                    
                    print("Recording 3 seconds... SPEAK NOW!")
                    audio_data = []
                    max_level = 0
                    avg_level = 0
                    
                    num_chunks = int(sample_rate / chunk_size * 3)  # 3 seconds
                    
                    for i in range(num_chunks):
                        data = stream.read(chunk_size, exception_on_overflow=False)
                        audio_data.append(data)
                        
                        # Calculate levels
                        audio_np = np.frombuffer(data, dtype=np.int16)
                        level = np.sqrt(np.mean(audio_np**2))
                        max_level = max(max_level, level)
                        avg_level += level
                        
                        # Show progress
                        progress = (i + 1) / num_chunks * 100
                        print(f"\rProgress: {progress:5.1f}% | Level: {level:6.0f} | Max: {max_level:6.0f}", end='')
                    
                    avg_level /= num_chunks
                    print(f"\nAverage level: {avg_level:.0f}, Max level: {max_level:.0f}")
                    
                    stream.stop_stream()
                    stream.close()
                    
                    # Convert to numpy array
                    audio_bytes = b''.join(audio_data)
                    audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                    
                    # Analyze audio
                    print(f"Audio stats:")
                    print(f"  Duration: {len(audio_np)/sample_rate:.2f} seconds")
                    print(f"  Range: {np.min(audio_np):.4f} to {np.max(audio_np):.4f}")
                    print(f"  RMS: {np.sqrt(np.mean(audio_np**2)):.4f}")
                    print(f"  Non-zero samples: {np.count_nonzero(audio_np)}/{len(audio_np)} ({np.count_nonzero(audio_np)/len(audio_np)*100:.1f}%)")
                    
                    # Check if audio seems to contain speech
                    if max_level > 1000:
                        print("  ✓ Good audio levels detected")
                        
                        # Save audio for inspection
                        filename = f"test_audio_{sample_rate}_{chunk_size}.wav"
                        with wave.open(filename, 'wb') as wf:
                            wf.setnchannels(1)
                            wf.setsampwidth(2)
                            wf.setframerate(sample_rate)
                            wf.writeframes(b''.join(audio_data))
                        print(f"  Audio saved as: {filename}")
                        
                        # Test with Whisper
                        print("  Testing with Whisper...")
                        model = whisper.load_model("tiny")  # Use tiny for faster testing
                        
                        result = model.transcribe(
                            audio_np,
                            language="en",
                            fp16=False,
                            verbose=False,
                            temperature=0.0
                        )
                        
                        text = result["text"].strip()
                        print(f"  Whisper result: '{text}'")
                        
                        if text:
                            print("  ✓ Speech successfully transcribed!")
                            return True
                        else:
                            print("  ✗ No speech detected by Whisper")
                    else:
                        print("  ✗ Audio levels too low - check microphone volume")
                        
                except Exception as e:
                    print(f"\nError with {sample_rate}Hz, chunk={chunk_size}: {e}")
                    continue
        
        return False
        
    except Exception as e:
        print(f"Recording failed: {e}")
        return False
    finally:
        audio.terminate()

def main():
    """Run interactive audio test"""
    print("This script will test different audio recording settings")
    print("Make sure to SPEAK CLEARLY when prompted")
    
    input("\nPress Enter to start...")
    
    success = record_with_feedback()
    
    if success:
        print("\n✓ Audio recording and transcription working!")
    else:
        print("\n✗ Audio issues detected. Try:")
        print("  1. Check microphone is connected and working")
        print("  2. Increase microphone volume in system settings")
        print("  3. Try a different microphone")
        print("  4. Close other applications using microphone")

if __name__ == "__main__":
    main()