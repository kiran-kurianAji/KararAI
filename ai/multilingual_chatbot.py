#!/usr/bin/env python3
"""
Hindi-English AI Chatbot
Supports Hindi and English with voice input/output
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import queue
import os
import tempfile
import wave
import pyaudio
import wave
import numpy as np
import whisper
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import pygame
import time

class HindiEnglishChatbot:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Hindi-English AI Chatbot")
        self.root.geometry("800x600")
        
        # Initialize components
        self.whisper_model = None
        self.recognizer = sr.Recognizer()  # Google Speech Recognition
        self.translator = Translator()
        self.audio_queue = queue.Queue()
        self.is_recording = False
        self.recording_thread = None
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.audio_data = []
        
        # Language settings
        self.input_language = "hi"  # Hindi by default
        self.output_language = "hi"  # Hindi by default
        
        # Initialize pygame for audio playback
        pygame.mixer.init()
        
        # Create UI
        self.create_ui()
        
        # Load Whisper model in background
        self.load_whisper_model()
        
    def create_ui(self):
        """Create the user interface"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Language selection frame
        lang_frame = ttk.LabelFrame(main_frame, text="Language Settings", padding="5")
        lang_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Input language
        ttk.Label(lang_frame, text="Input Language:").grid(row=0, column=0, padx=(0, 5))
        self.input_lang_var = tk.StringVar(value="Hindi")
        input_lang_combo = ttk.Combobox(lang_frame, textvariable=self.input_lang_var, 
                                       values=["Hindi", "English"], state="readonly")
        input_lang_combo.grid(row=0, column=1, padx=(0, 20))
        input_lang_combo.bind('<<ComboboxSelected>>', self.on_input_language_change)
        
        # Output language
        ttk.Label(lang_frame, text="Output Language:").grid(row=0, column=2, padx=(0, 5))
        self.output_lang_var = tk.StringVar(value="Hindi")
        output_lang_combo = ttk.Combobox(lang_frame, textvariable=self.output_lang_var,
                                        values=["Hindi", "English"], state="readonly")
        output_lang_combo.grid(row=0, column=3)
        output_lang_combo.bind('<<ComboboxSelected>>', self.on_output_language_change)
        
        # Chat display
        chat_frame = ttk.LabelFrame(main_frame, text="Chat", padding="5")
        chat_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        chat_frame.columnconfigure(0, weight=1)
        chat_frame.rowconfigure(0, weight=1)
        
        self.chat_display = scrolledtext.ScrolledText(chat_frame, height=15, state=tk.DISABLED)
        self.chat_display.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Input frame
        input_frame = ttk.Frame(main_frame)
        input_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        input_frame.columnconfigure(0, weight=1)
        
        # Text input
        self.text_input = tk.Text(input_frame, height=3)
        self.text_input.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 5))
        
        # Buttons frame
        buttons_frame = ttk.Frame(input_frame)
        buttons_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E))
        
        # Voice input button
        self.voice_button = ttk.Button(buttons_frame, text="🎤 Start Voice Input", 
                                      command=self.toggle_voice_input)
        self.voice_button.grid(row=0, column=0, padx=(0, 5))
        
        # Send button
        send_button = ttk.Button(buttons_frame, text="Send Text", command=self.send_text_message)
        send_button.grid(row=0, column=1, padx=(0, 5))
        
        # Clear button
        clear_button = ttk.Button(buttons_frame, text="Clear Chat", command=self.clear_chat)
        clear_button.grid(row=0, column=2)
        
        # Status and debugging frame
        status_frame = ttk.Frame(main_frame)
        status_frame.grid(row=3, column=0, columnspan=2, pady=(5, 0), sticky=(tk.W, tk.E))
        status_frame.columnconfigure(1, weight=1)
        
        ttk.Label(status_frame, text="Audio Level:").grid(row=0, column=0, padx=(0, 5))
        self.audio_meter = ttk.Progressbar(status_frame, length=200, mode='determinate')
        self.audio_meter.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(0, 10))
        
        # Status label
        self.status_label = ttk.Label(status_frame, text="Ready", foreground="green")
        self.status_label.grid(row=0, column=2)
        
        # Audio info label for debugging
        self.audio_info_label = ttk.Label(status_frame, text="", foreground="blue", font=("Arial", 8))
        self.audio_info_label.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(2, 0))
        
        # Bind Enter key to send message
        self.text_input.bind('<Control-Return>', lambda e: self.send_text_message())
        
    def on_input_language_change(self, event):
        """Handle input language change"""
        lang_map = {"Hindi": "hi", "English": "en"}
        self.input_language = lang_map[self.input_lang_var.get()]
        
    def on_output_language_change(self, event):
        """Handle output language change"""
        lang_map = {"Hindi": "hi", "English": "en"}
        self.output_language = lang_map[self.output_lang_var.get()]
        
    def load_whisper_model(self):
        """Load Whisper model in background thread"""
        def load_model():
            try:
                self.update_status("Loading Whisper model (base - better accuracy)...")
                # Use 'base' model for better accuracy for Hindi and English
                self.whisper_model = whisper.load_model("base")
                self.update_status("Whisper model loaded successfully")
            except Exception as e:
                self.update_status(f"Error loading Whisper model: {str(e)}", "red")
                
        threading.Thread(target=load_model, daemon=True).start()
        
    def update_status(self, message, color="green"):
        """Update status label"""
        self.status_label.config(text=message, foreground=color)
        
    def toggle_voice_input(self):
        """Toggle voice recording"""
        if not self.is_recording:
            if self.whisper_model is None:
                messagebox.showerror("Error", "Whisper model is still loading. Please wait.")
                return
                
            # Check microphone access
            if not self.check_microphone_access():
                messagebox.showerror("Microphone Error", 
                    "Cannot access microphone. Please check:\n"
                    "1. Microphone is connected\n"
                    "2. Microphone permissions are granted\n"
                    "3. No other app is using the microphone")
                return
                
            self.start_recording()
        else:
            self.stop_recording()
            
    def check_microphone_access(self):
        """Check if microphone is accessible"""
        try:
            # Try to open and immediately close the microphone
            test_stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=16000,
                input=True,
                frames_per_buffer=1024
            )
            test_stream.stop_stream()
            test_stream.close()
            return True
        except Exception as e:
            print(f"Microphone access error: {e}")
            return False
            
    def start_recording(self):
        """Start voice recording"""
        self.is_recording = True
        self.voice_button.config(text="🛑 Stop Recording")
        self.update_status("Recording... Speak now", "blue")
        
        # Start recording in separate thread
        self.recording_thread = threading.Thread(target=self.record_audio, daemon=True)
        self.recording_thread.start()
        
    def stop_recording(self):
        """Stop voice recording"""
        self.is_recording = False
        self.voice_button.config(text="🎤 Start Voice Input")
        self.update_status("Processing audio...", "orange")
        
    def record_audio(self):
        """Record audio from microphone using pyaudio"""
        try:
            # Audio parameters optimized for Whisper
            sample_rate = 16000  # Whisper's native sample rate
            chunk_size = 1024
            channels = 1
            format = pyaudio.paInt16
            
            # Initialize audio stream with better settings
            self.stream = self.audio.open(
                format=format,
                channels=channels,
                rate=sample_rate,
                input=True,
                frames_per_buffer=chunk_size,
                input_device_index=None  # Use default input device
            )
            
            self.audio_data = []
            self.update_status("Recording... Speak clearly", "blue")
            
            # Record audio in chunks - no auto-stop, user controls recording
            while self.is_recording:
                try:
                    data = self.stream.read(chunk_size, exception_on_overflow=False)
                    self.audio_data.append(data)
                    
                    # Calculate audio level for meter
                    audio_np = np.frombuffer(data, dtype=np.int16)
                    audio_level = np.sqrt(np.mean(audio_np**2))
                    level_percentage = min(100, (audio_level / 5000) * 100)  # Adjusted scale
                    self.audio_meter['value'] = level_percentage
                    
                    self.root.update_idletasks()
                    
                except Exception as e:
                    print(f"Recording chunk error: {e}")
                    break
            
            # Stop recording
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
                self.stream = None
            
            # Process the recorded audio
            if len(self.audio_data) > 0:
                # Use Google Speech Recognition first for both Hindi and English, fallback to Whisper
                if self.input_language == "hi":
                    self.process_audio_google_sr_hindi(self.audio_data, sample_rate)
                else:  # English
                    self.process_audio_google_sr_english(self.audio_data, sample_rate)
                
        except Exception as e:
            self.update_status(f"Recording error: {str(e)}", "red")
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
                self.stream = None
            
    def process_audio(self, audio_data, sample_rate):
        """Process recorded audio with Whisper"""
        try:
            # Convert pyaudio data to numpy array
            audio_bytes = b''.join(audio_data)
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Map UI language to Whisper language codes
            whisper_lang_map = {
                "hi": "hi",      # Hindi
                "en": "en"       # English
            }
            
            target_language = whisper_lang_map.get(self.input_language, "en")
            
            # Standard preprocessing for Hindi/English
            audio_np = self.preprocess_audio(audio_np, sample_rate)
            
            # More lenient minimum duration check for Hindi
            min_duration = 0.15 if target_language == "hi" else 0.3
            if len(audio_np) < sample_rate * min_duration:
                lang_name = "Hindi" if target_language == "hi" else "English"
                self.update_status(f"Audio too short for {lang_name}, please speak longer", "orange")
                print(f"Audio rejected - too short for {lang_name}: {len(audio_np)/sample_rate:.2f}s (min: {min_duration}s)")
                return
            
            # Reset audio meter
            self.audio_meter['value'] = 0
            
            # Calculate audio duration first (needed for logging and validation)
            audio_duration = len(audio_np)/sample_rate
            
            # Language-specific Whisper settings for Hindi vs English
            if target_language == "hi":
                # Hindi-optimized settings
                self.update_status("Transcribing Hindi speech...", "orange")
                print(f"Hindi audio processed successfully: {audio_duration:.2f}s")
                result = self.whisper_model.transcribe(
                    audio_np,
                    language="hi",             # Explicitly set Hindi
                    fp16=False,                # Use fp32 for better compatibility
                    verbose=False,             # Disable verbose to reduce noise
                    initial_prompt="यह हिंदी भाषा में है। मेरा नाम",  # More comprehensive Hindi prompt
                    word_timestamps=False,     # Disable for faster processing
                    temperature=0.1,           # Lower temperature for more consistent results
                    compression_ratio_threshold=1.8,  # Even more lenient for Hindi
                    logprob_threshold=-1.5,    # Very lenient threshold for Hindi
                    no_speech_threshold=0.3,   # Even lower threshold for Hindi
                    condition_on_previous_text=False,  # Don't use previous context
                    beam_size=5,               # Larger beam for better Hindi accuracy
                    best_of=5,                 # Consider more candidates for Hindi
                    suppress_blank=False,      # Don't suppress blank tokens
                    suppress_tokens=[-1]       # Only suppress the end-of-text token
                )
            else:
                # English settings (existing optimized settings)
                self.update_status("Transcribing English speech...", "orange")
                result = self.whisper_model.transcribe(
                    audio_np,
                    language="en",             # Explicitly set English
                    fp16=False,                # Use fp32 for better compatibility
                    verbose=False,             # Disable verbose to reduce noise
                    initial_prompt="",         # Clear initial prompt to avoid bias
                    word_timestamps=False,     # Disable for faster processing
                    temperature=0.0,           # Use deterministic decoding (no randomness)
                    compression_ratio_threshold=2.4,  # Detect repetitive/nonsensical output
                    logprob_threshold=-1.0,    # Only accept high-confidence words
                    no_speech_threshold=0.6,   # Higher threshold to avoid false positives
                    condition_on_previous_text=False,  # Don't use previous context (prevents hallucination)
                    hallucination_silence_threshold=None  # Let Whisper handle this internally
                )
            
            transcribed_text = result["text"].strip()
            detected_language = result.get("language", "unknown")
            
            # Additional validation to prevent hallucination
            if transcribed_text:
                # Check for obvious hallucination patterns
                if self.is_likely_hallucination(transcribed_text, audio_duration, target_language):
                    print(f"Detected potential hallucination: '{transcribed_text}'")
                    transcribed_text = ""  # Reject the transcription
                else:
                    print(f"Transcription accepted: '{transcribed_text}'")
            else:
                print(f"No transcription returned from Whisper for {target_language}")
            
            # Log detection results for debugging
            print(f"Detected language: {detected_language}")
            print(f"Transcribed text: '{transcribed_text}'")
            print(f"Audio length: {audio_duration:.2f} seconds")
            print(f"Target language: {target_language}")
            
            # Update audio info label
            self.audio_info_label.config(text=f"Audio: {audio_duration:.1f}s | Detected: {detected_language.upper()}")
            
            if transcribed_text:
                # Display detection info
                self.add_message_to_chat("🎤 Speech Detection", 
                    f'Language: {detected_language.upper()}, Duration: {audio_duration:.1f}s, Text: "{transcribed_text}"')
                
                # Add to chat as user message
                self.add_message_to_chat("You (Voice)", transcribed_text)
                
                # Process the message
                self.process_user_message(transcribed_text)
                
                self.update_status("Speech processed successfully", "green")
            else:
                if target_language == "hi":
                    self.update_status("हिंदी में बोलिए - No Hindi speech detected, speak clearly", "orange")
                else:
                    self.update_status("No English speech detected - try speaking more clearly", "orange")
                
        except Exception as e:
            self.update_status(f"Audio processing error: {str(e)}", "red")
            print(f"Detailed error: {e}")
            
    def process_audio_google_sr_hindi(self, audio_data, sample_rate):
        """Process Hindi audio with Google Speech Recognition first, fallback to Whisper"""
        try:
            self.update_status("Trying Google Speech Recognition for Hindi...", "orange")
            
            # Convert pyaudio data to numpy array first
            audio_bytes = b''.join(audio_data)
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
            
            # Calculate audio duration for validation
            audio_duration = len(audio_np) / sample_rate
            
            # Check minimum requirements
            if audio_duration < 0.5:
                print(f"Google SR Hindi - Audio too short: {audio_duration:.2f}s")
                self.update_status("Audio too short for Hindi - speak longer", "orange")
                return
            
            # Apply audio preprocessing for Google SR
            audio_np = audio_np - np.mean(audio_np)  # Remove DC offset
            
            # Amplify quiet signals
            max_val = np.max(np.abs(audio_np))
            if max_val > 0:
                # Normalize but don't over-amplify
                amplification = min(3.0, 20000.0 / max_val)
                audio_np = (audio_np * amplification).astype(np.int16)
                print(f"Google SR Hindi - Applied amplification: {amplification:.2f}x")
            
            # Convert back to bytes for speech_recognition
            audio_bytes_processed = audio_np.tobytes()
            
            # Create AudioData object for speech_recognition
            audio_data_sr = sr.AudioData(audio_bytes_processed, sample_rate, 2)  # 2 bytes per sample for 16-bit
            
            print(f"Google SR Hindi - Audio duration: {audio_duration:.2f}s, Max amplitude: {np.max(np.abs(audio_np))}")
            
            try:
                # Use Google Speech Recognition with Hindi language
                print("Google SR Hindi - Starting transcription...")
                transcribed_text = self.recognizer.recognize_google(
                    audio_data_sr, 
                    language="hi-IN",  # Hindi India
                    show_all=False
                )
                
                print(f"Google SR Hindi - SUCCESS: '{transcribed_text}'")
                
                if transcribed_text and len(transcribed_text.strip()) > 0:
                    # Update audio info
                    self.audio_info_label.config(text=f"Audio: {audio_duration:.1f}s | Google SR: Hindi")
                    
                    # Display detection info
                    self.add_message_to_chat("🎤 Speech Detection (Google SR)", 
                        f'Language: Hindi, Duration: {audio_duration:.1f}s, Text: "{transcribed_text}"')
                    
                    # Add to chat as user message
                    self.add_message_to_chat("You (Voice - Hindi)", transcribed_text)
                    
                    # Process the message
                    self.process_user_message(transcribed_text)
                    
                    self.update_status("Hindi speech processed successfully with Google SR", "green")
                else:
                    print("Google SR Hindi - Empty result, falling back to Whisper")
                    self.fallback_to_whisper_hindi(audio_data, sample_rate)
                    
            except sr.UnknownValueError:
                print("Google SR Hindi - Could not understand audio, falling back to Whisper")
                self.update_status("Google SR couldn't understand - trying Whisper...", "orange")
                self.fallback_to_whisper_hindi(audio_data, sample_rate)
                
            except sr.RequestError as e:
                print(f"Google SR Hindi - Network error: {e}, falling back to Whisper")
                self.update_status("Network error - trying Whisper...", "orange")
                self.fallback_to_whisper_hindi(audio_data, sample_rate)
                
        except Exception as e:
            print(f"Google SR Hindi - Unexpected error: {e}, falling back to Whisper")
            self.update_status("Google SR error - trying Whisper...", "orange")
            self.fallback_to_whisper_hindi(audio_data, sample_rate)
            
    def process_audio_google_sr_english(self, audio_data, sample_rate):
        """Process English audio with Google Speech Recognition first, fallback to Whisper"""
        try:
            self.update_status("Trying Google Speech Recognition for English...", "orange")
            
            # Convert pyaudio data to numpy array first
            audio_bytes = b''.join(audio_data)
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
            
            # Calculate audio duration for validation
            audio_duration = len(audio_np) / sample_rate
            
            # Check minimum requirements
            if audio_duration < 0.3:  # Slightly longer minimum for English
                print(f"Google SR English - Audio too short: {audio_duration:.2f}s")
                self.update_status("Audio too short for English - speak longer", "orange")
                return
            
            # Apply audio preprocessing for Google SR
            audio_np = audio_np - np.mean(audio_np)  # Remove DC offset
            
            # Amplify quiet signals (less aggressive for English)
            max_val = np.max(np.abs(audio_np))
            if max_val > 0:
                # Normalize but don't over-amplify for English
                amplification = min(2.5, 15000.0 / max_val)
                audio_np = (audio_np * amplification).astype(np.int16)
                print(f"Google SR English - Applied amplification: {amplification:.2f}x")
            
            # Convert back to bytes for speech_recognition
            audio_bytes_processed = audio_np.tobytes()
            
            # Create AudioData object for speech_recognition
            audio_data_sr = sr.AudioData(audio_bytes_processed, sample_rate, 2)  # 2 bytes per sample for 16-bit
            
            print(f"Google SR English - Audio duration: {audio_duration:.2f}s, Max amplitude: {np.max(np.abs(audio_np))}")
            
            try:
                # Use Google Speech Recognition with English language
                print("Google SR English - Starting transcription...")
                transcribed_text = self.recognizer.recognize_google(
                    audio_data_sr, 
                    language="en-US",  # English US
                    show_all=False
                )
                
                print(f"Google SR English - SUCCESS: '{transcribed_text}'")
                
                if transcribed_text and len(transcribed_text.strip()) > 0:
                    # Update audio info
                    self.audio_info_label.config(text=f"Audio: {audio_duration:.1f}s | Google SR: English")
                    
                    # Display detection info
                    self.add_message_to_chat("🎤 Speech Detection (Google SR)", 
                        f'Language: English, Duration: {audio_duration:.1f}s, Text: "{transcribed_text}"')
                    
                    # Add to chat as user message
                    self.add_message_to_chat("You (Voice - English)", transcribed_text)
                    
                    # Process the message
                    self.process_user_message(transcribed_text)
                    
                    self.update_status("English speech processed successfully with Google SR", "green")
                else:
                    print("Google SR English - Empty result, falling back to Whisper")
                    self.fallback_to_whisper_english(audio_data, sample_rate)
                    
            except sr.UnknownValueError:
                print("Google SR English - Could not understand audio, falling back to Whisper")
                self.update_status("Google SR couldn't understand - trying Whisper...", "orange")
                self.fallback_to_whisper_english(audio_data, sample_rate)
                
            except sr.RequestError as e:
                print(f"Google SR English - Network error: {e}, falling back to Whisper")
                self.update_status("Network error - trying Whisper...", "orange")
                self.fallback_to_whisper_english(audio_data, sample_rate)
                
        except Exception as e:
            print(f"Google SR English - Unexpected error: {e}, falling back to Whisper")
            self.update_status("Google SR error - trying Whisper...", "orange")
            self.fallback_to_whisper_english(audio_data, sample_rate)
            
    def fallback_to_whisper_english(self, audio_data, sample_rate):
        """Fallback to Whisper for English when Google SR fails"""
        try:
            self.update_status("Fallback: Using Whisper for English...", "orange")
            
            # Convert to the format expected by process_audio
            audio_bytes = b''.join(audio_data)
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Use existing Whisper processing but force English
            old_input_lang = self.input_language
            self.input_language = "en"  # Ensure it's set to English
            
            # Process with existing Whisper logic
            self.process_audio_whisper_only(audio_np, sample_rate, "en")
            
            # Restore original language setting
            self.input_language = old_input_lang
            
        except Exception as e:
            print(f"Whisper English fallback error: {e}")
            self.update_status("Both Google SR and Whisper failed for English", "red")
            
    def fallback_to_whisper_hindi(self, audio_data, sample_rate):
        """Fallback to Whisper for Hindi when Google SR fails"""
        try:
            self.update_status("Fallback: Using Whisper for Hindi...", "orange")
            
            # Convert to the format expected by process_audio
            audio_bytes = b''.join(audio_data)
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Use existing Whisper processing but force Hindi
            old_input_lang = self.input_language
            self.input_language = "hi"  # Ensure it's set to Hindi
            
            # Process with existing Whisper logic
            self.process_audio_whisper_only(audio_np, sample_rate, "hi")
            
            # Restore original language setting
            self.input_language = old_input_lang
            
        except Exception as e:
            print(f"Whisper Hindi fallback error: {e}")
            self.update_status("Both Google SR and Whisper failed for Hindi", "red")
            
    def process_audio_whisper_only(self, audio_np, sample_rate, force_language=None):
        """Process audio with Whisper only (extracted from process_audio)"""
        try:
            # Map UI language to Whisper language codes
            whisper_lang_map = {
                "hi": "hi",      # Hindi
                "en": "en"       # English
            }
            
            target_language = force_language or whisper_lang_map.get(self.input_language, "en")
            
            # Standard preprocessing for Hindi/English
            audio_np = self.preprocess_audio(audio_np, sample_rate)
            
            # More lenient minimum duration check for Hindi
            min_duration = 0.15 if target_language == "hi" else 0.3
            if len(audio_np) < sample_rate * min_duration:
                lang_name = "Hindi" if target_language == "hi" else "English"
                self.update_status(f"Audio too short for {lang_name}, please speak longer", "orange")
                print(f"Audio rejected - too short for {lang_name}: {len(audio_np)/sample_rate:.2f}s (min: {min_duration}s)")
                return
            
            # Reset audio meter
            self.audio_meter['value'] = 0
            
            # Calculate audio duration first (needed for logging and validation)
            audio_duration = len(audio_np)/sample_rate
            
            # Language-specific Whisper settings for Hindi vs English
            if target_language == "hi":
                # Hindi-optimized settings
                self.update_status("Transcribing Hindi speech with Whisper...", "orange")
                print(f"Whisper Hindi - Processing: {audio_duration:.2f}s")
                result = self.whisper_model.transcribe(
                    audio_np,
                    language="hi",             # Explicitly set Hindi
                    fp16=False,                # Use fp32 for better compatibility
                    verbose=False,             # Disable verbose to reduce noise
                    initial_prompt="यह हिंदी भाषा में है। मेरा नाम",  # More comprehensive Hindi prompt
                    word_timestamps=False,     # Disable for faster processing
                    temperature=0.1,           # Lower temperature for more consistent results
                    compression_ratio_threshold=1.8,  # Even more lenient for Hindi
                    logprob_threshold=-1.5,    # Very lenient threshold for Hindi
                    no_speech_threshold=0.3,   # Even lower threshold for Hindi
                    condition_on_previous_text=False,  # Don't use previous context
                    beam_size=5,               # Larger beam for better Hindi accuracy
                    best_of=5,                 # Consider more candidates for Hindi
                    suppress_blank=False,      # Don't suppress blank tokens
                    suppress_tokens=[-1]       # Only suppress the end-of-text token
                )
            else:
                # English settings (existing optimized settings)
                self.update_status("Transcribing English speech...", "orange")
                result = self.whisper_model.transcribe(
                    audio_np,
                    language="en",             # Explicitly set English
                    fp16=False,                # Use fp32 for better compatibility
                    verbose=False,             # Disable verbose to reduce noise
                    initial_prompt="",         # Clear initial prompt to avoid bias
                    word_timestamps=False,     # Disable for faster processing
                    temperature=0.0,           # Use deterministic decoding (no randomness)
                    compression_ratio_threshold=2.4,  # Detect repetitive/nonsensical output
                    logprob_threshold=-1.0,    # Only accept high-confidence words
                    no_speech_threshold=0.6,   # Higher threshold to avoid false positives
                    condition_on_previous_text=False,  # Don't use previous context (prevents hallucination)
                    hallucination_silence_threshold=None  # Let Whisper handle this internally
                )
            
            transcribed_text = result["text"].strip()
            detected_language = result.get("language", "unknown")
            
            # Additional validation to prevent hallucination
            if transcribed_text:
                # Check for obvious hallucination patterns
                if self.is_likely_hallucination(transcribed_text, audio_duration, target_language):
                    print(f"Whisper - Detected potential hallucination: '{transcribed_text}'")
                    transcribed_text = ""  # Reject the transcription
                else:
                    print(f"Whisper - Transcription accepted: '{transcribed_text}'")
            else:
                print(f"Whisper - No transcription returned for {target_language}")
            
            # Log detection results for debugging
            print(f"Whisper - Detected language: {detected_language}")
            print(f"Whisper - Transcribed text: '{transcribed_text}'")
            print(f"Whisper - Audio length: {audio_duration:.2f} seconds")
            print(f"Whisper - Target language: {target_language}")
            
            # Update audio info label
            self.audio_info_label.config(text=f"Audio: {audio_duration:.1f}s | Whisper: {detected_language.upper()}")
            
            if transcribed_text:
                # Display detection info
                self.add_message_to_chat("🎤 Speech Detection (Whisper)", 
                    f'Language: {detected_language.upper()}, Duration: {audio_duration:.1f}s, Text: "{transcribed_text}"')
                
                # Add to chat as user message
                self.add_message_to_chat("You (Voice)", transcribed_text)
                
                # Process the message
                self.process_user_message(transcribed_text)
                
                self.update_status("Speech processed successfully with Whisper", "green")
            else:
                if target_language == "hi":
                    self.update_status("हिंदी में बोलिए - No Hindi speech detected with Whisper", "orange")
                else:
                    self.update_status("No English speech detected with Whisper", "orange")
                
        except Exception as e:
            self.update_status(f"Whisper processing error: {str(e)}", "red")
            print(f"Whisper detailed error: {e}")
            
    def is_likely_hallucination(self, text, audio_duration, target_language="en"):
        """Detect potential hallucination in transcribed text"""
        # Common hallucination patterns to filter out
        
        # 1. Very long text for short audio (adjust for language)
        word_count = len(text.split())
        if target_language == "hi":
            max_words_per_second = 8  # Hindi can be slower, more complex words
        else:
            max_words_per_second = 10  # English default
            
        if audio_duration > 0 and (word_count / audio_duration) > max_words_per_second:
            print(f"Rejecting: too many words per second ({word_count}/{audio_duration:.2f} = {word_count/audio_duration:.1f} wps)")
            return True
            
        # 2. Repetitive patterns (same word/phrase repeated)
        words = text.lower().split()
        if len(words) > 3:
            # Check for excessive repetition
            unique_words = set(words)
            if len(unique_words) < len(words) * 0.3:  # Less than 30% unique words
                print(f"Rejecting: too repetitive ({len(unique_words)}/{len(words)} unique)")
                return True
                
        # 3. Common Whisper hallucination phrases (mostly English)
        if target_language == "en":
            hallucination_phrases = [
                "thank you for watching",
                "please like and subscribe",
                "don't forget to subscribe",
                "thanks for watching",
                "see you next time",
                "bye bye",
                "thank you very much",
                "you know what I mean"
            ]
            
            text_lower = text.lower()
            for phrase in hallucination_phrases:
                if phrase in text_lower:
                    print(f"Rejecting: contains hallucination phrase '{phrase}'")
                    return True
        
        # 4. Hindi-specific validation
        elif target_language == "hi":
            # Check if text contains Hindi characters (Devanagari script)
            hindi_chars = set('अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ्')
            text_chars = set(text)
            
            # If text contains Hindi characters, it's likely valid
            if hindi_chars.intersection(text_chars):
                print(f"Accepting Hindi Devanagari script: {text}")
                return False  # Not a hallucination
            
            # If no Hindi characters, check if it might be transliteration
            # Accept reasonable length transliterations but reject very short ones
            if len(text.strip()) >= 2:  # Very lenient for Hindi
                print(f"Accepting possible Hindi transliteration: {text}")
                return False  # Accept transliterations
            else:
                print(f"Rejecting too short Hindi text: {text}")
                return True   # Reject very short text
                    
        # 5. Excessive filler words
        filler_words = ["uh", "um", "ah", "er", "mm"]
        filler_count = sum(1 for word in words if word.lower() in filler_words)
        if len(words) > 0 and (filler_count / len(words)) > 0.5:  # More than 50% filler
            print(f"Rejecting: too many filler words ({filler_count}/{len(words)})")
            return True
            
        # 6. Single repeated character/sound
        if len(text) > 10 and len(set(text.replace(" ", ""))) <= 2:
            print(f"Rejecting: too repetitive characters")
            return True
            
        return False
            
    def preprocess_audio(self, audio_data, sample_rate):
        """Preprocess audio for better Whisper performance with English and Hindi"""
        try:
            # Remove DC offset
            audio_data = audio_data - np.mean(audio_data)
            
            # Normalize audio more conservatively to avoid clipping
            max_val = np.max(np.abs(audio_data))
            if max_val > 0:
                # More aggressive normalization for Hindi to handle quiet speech
                audio_data = audio_data / max_val * 0.98
            
            # For Hindi, use minimal trimming to preserve all speech content
            if self.input_language == "hi":
                # Very gentle energy-based trimming for Hindi
                frame_length = int(0.050 * sample_rate)  # 50ms frames (longer for Hindi)
                hop_length = int(0.020 * sample_rate)    # 20ms hop (longer stride)
                
                # Calculate frame energy
                frames = []
                for i in range(0, len(audio_data) - frame_length, hop_length):
                    frame = audio_data[i:i + frame_length]
                    energy = np.sum(frame ** 2)
                    frames.append(energy)
                
                if len(frames) > 0:
                    # Use very lenient threshold for Hindi (10th percentile)
                    energy_threshold = np.percentile(frames, 10)
                    voice_frames = [i for i, energy in enumerate(frames) if energy > energy_threshold]
                    
                    if len(voice_frames) > 0:
                        # Include generous buffer frames for Hindi (10 frames before/after)
                        start_frame = max(0, voice_frames[0] - 10)
                        end_frame = min(len(frames), voice_frames[-1] + 10)
                        
                        start_sample = start_frame * hop_length
                        end_sample = min(len(audio_data), end_frame * hop_length)
                        
                        if end_sample > start_sample:
                            audio_data = audio_data[start_sample:end_sample]
                
                # Very lenient minimum audio requirement for Hindi (0.15 seconds)
                if len(audio_data) < sample_rate * 0.15:
                    print(f"Hindi audio too short after preprocessing: {len(audio_data)/sample_rate:.2f}s")
                    return audio_data  # Return original instead of empty for Hindi
                    
            else:
                # Standard processing for English
                frame_length = int(0.025 * sample_rate)  # 25ms frames
                hop_length = int(0.010 * sample_rate)    # 10ms hop
                
                # Calculate frame energy
                frames = []
                for i in range(0, len(audio_data) - frame_length, hop_length):
                    frame = audio_data[i:i + frame_length]
                    energy = np.sum(frame ** 2)
                    frames.append(energy)
                
                if len(frames) > 0:
                    # Standard threshold for English (30th percentile)
                    energy_threshold = np.percentile(frames, 30)
                    voice_frames = [i for i, energy in enumerate(frames) if energy > energy_threshold]
                    
                    if len(voice_frames) > 0:
                        # Standard buffer frames for English (3 frames before/after)
                        start_frame = max(0, voice_frames[0] - 3)
                        end_frame = min(len(frames), voice_frames[-1] + 3)
                        
                        start_sample = start_frame * hop_length
                        end_sample = end_frame * hop_length
                        
                        audio_data = audio_data[start_sample:end_sample]
                
                # Standard minimum audio requirement for English (0.3 seconds)
                if len(audio_data) < sample_rate * 0.3:
                    print(f"English audio too short after preprocessing: {len(audio_data)/sample_rate:.2f}s")
                    return np.array([])  # Return empty array for English
            
            final_duration = len(audio_data)/sample_rate
            print(f"Audio processed successfully for {self.input_language}: {final_duration:.2f}s")
            return audio_data
            
        except Exception as e:
            print(f"Audio preprocessing error: {e}")
            return audio_data
            
            
    def send_text_message(self):
        """Send text message"""
        message = self.text_input.get("1.0", tk.END).strip()
        if message:
            self.add_message_to_chat("You (Text)", message)
            self.text_input.delete("1.0", tk.END)
            self.process_user_message(message)
            
    def process_user_message(self, message):
        """Process user message and generate response"""
        try:
            self.update_status("Processing message...", "orange")
            
            # Skip translation if input and output languages are the same
            if self.input_language == self.output_language:
                # Direct processing without translation for same language
                self.update_status(f"Processing {self.input_language.upper()} message directly...", "orange")
                translated_message = message  # Use original message
                self.add_message_to_chat(f"Direct {self.input_language.upper()} Input", message)
            else:
                # Translate to English if needed (for different languages)
                if self.input_language != "en":
                    self.update_status("Translating to English...", "orange")
                    translated_message = self.translate_text(message, self.input_language, "en")
                    self.add_message_to_chat("Translated to English", translated_message)
                else:
                    translated_message = message
                
            # Generate AI response (placeholder)
            self.update_status("Generating AI response...", "orange")
            ai_response = self.generate_ai_response(translated_message)
            
            # Handle response translation
            if self.input_language == self.output_language:
                # Same language - no translation needed
                final_response = ai_response
            else:
                # Different languages - translate response
                if self.output_language != "en":
                    self.update_status("Translating response...", "orange")
                    final_response = self.translate_text(ai_response, "en", self.output_language)
                else:
                    final_response = ai_response
                
            # Add AI response to chat
            self.add_message_to_chat("AI Assistant", final_response)
            
            # Convert to speech with proper language handling
            if self.input_language == self.output_language:
                # Same language - use the language directly
                self.update_status(f"Converting to {self.output_language.upper()} speech...", "orange")
                self.text_to_speech(final_response, self.output_language)
            else:
                # Different languages - use output language
                self.update_status("Converting to speech...", "orange")
                self.text_to_speech(final_response, self.output_language)
            
            self.update_status("Ready", "green")
            
        except Exception as e:
            self.update_status(f"Error processing message: {str(e)}", "red")
            
    def translate_text(self, text, source_lang, target_lang):
        """Translate text using Google Translate"""
        try:
            result = self.translator.translate(text, src=source_lang, dest=target_lang)
            return result.text
        except Exception as e:
            print(f"Translation error: {e}")
            self.update_status(f"Translation failed: {str(e)}", "red")
            return text  # Return original text if translation fails
            
    def generate_ai_response(self, message):
        """Generate AI response (placeholder function)"""
        # This is a placeholder function that can be replaced with:
        # - Local LLM integration (Ollama, GPT4All, etc.)
        # - API calls to free services
        # - Rule-based responses
        
        responses = [
            f"I understand you said: '{message}'. This is a placeholder response. You can integrate this with a local LLM or free AI service.",
            f"Thank you for your message: '{message}'. I'm a multilingual chatbot that can understand and respond in multiple languages.",
            f"Your message '{message}' has been processed. I can help you with various tasks once you integrate a proper AI model.",
            f"I received your message: '{message}'. The voice and translation features are working! You can now add your preferred AI model."
        ]
        
        import random
        return random.choice(responses)
        
    def text_to_speech(self, text, language):
        """Convert text to speech using gTTS"""
        try:
            # Create temporary file for audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                # Generate speech
                tts = gTTS(text=text, lang=language, slow=False)
                tts.save(tmp_file.name)
                
                # Play audio
                pygame.mixer.music.load(tmp_file.name)
                pygame.mixer.music.play()
                
                # Wait for playback to complete
                while pygame.mixer.music.get_busy():
                    time.sleep(0.1)
                    
                # Clean up
                os.unlink(tmp_file.name)
                
        except Exception as e:
            print(f"TTS error: {e}")
            
    def add_message_to_chat(self, sender, message):
        """Add message to chat display"""
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, f"{sender}: {message}\n\n")
        self.chat_display.config(state=tk.DISABLED)
        self.chat_display.see(tk.END)
        
    def clear_chat(self):
        """Clear chat display"""
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.delete("1.0", tk.END)
        self.chat_display.config(state=tk.DISABLED)
        
    def run(self):
        """Start the chatbot application"""
        try:
            self.root.mainloop()
        finally:
            # Clean up audio resources
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
            if self.audio:
                self.audio.terminate()

if __name__ == "__main__":
    # Check if required packages are installed
    try:
        import whisper
        import googletrans
        import gtts
        import pyaudio
        import pygame
    except ImportError as e:
        print(f"Missing required package: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        exit(1)
        
    # Create and run the chatbot
    chatbot = HindiEnglishChatbot()
    chatbot.run()
