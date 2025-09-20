// Voice Service for Hindi-English Voice Integration
// This service handles voice recording, speech-to-text, and text-to-speech

export interface VoiceRecording {
  audioBlob: Blob;
  duration: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
}

export interface VoiceServiceConfig {
  enabled: boolean;
  inputLanguage: 'hi' | 'en';
  outputLanguage: 'hi' | 'en';
}

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private stream: MediaStream | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // Voice configuration
  private config: VoiceServiceConfig = {
    enabled: false,
    inputLanguage: 'hi',
    outputLanguage: 'hi'
  };

  constructor() {
    // Load saved voice settings
    const savedConfig = localStorage.getItem('voiceConfig');
    if (savedConfig) {
      try {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      } catch (error) {
        console.error('Error loading voice config:', error);
      }
    }
  }

  // Configuration methods
  setConfig(config: Partial<VoiceServiceConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('voiceConfig', JSON.stringify(this.config));
  }

  getConfig(): VoiceServiceConfig {
    return { ...this.config };
  }

  isVoiceEnabled(): boolean {
    return this.config.enabled;
  }

  // Stop any currently playing audio
  stopAudio(): void {
    // Stop HTML audio element
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop speech synthesis
    if (this.currentUtterance || speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  // Get current audio playing status
  isAudioPlaying(): boolean {
    return (this.currentAudio && !this.currentAudio.paused) || speechSynthesis.speaking;
  }

  // Check if browser supports voice recording
  isSupported(): boolean {
    return !!(navigator.mediaDevices && 
              navigator.mediaDevices.getUserMedia && 
              window.MediaRecorder);
  }

  // Request microphone permission
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Start voice recording
  async startRecording(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Voice recording not supported in this browser');
    }

    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Collect data every 250ms
      this.isRecording = true;
      return true;

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Could not start recording. Please check microphone permissions.');
    }
  }

  // Stop voice recording and return audio blob
  async stopRecording(): Promise<VoiceRecording | null> {
    if (!this.isRecording || !this.mediaRecorder) {
      return null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
        const duration = this.audioChunks.length * 0.25; // Approximate duration
        
        // Cleanup
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        this.isRecording = false;
        
        resolve({
          audioBlob,
          duration
        });
      };

      this.mediaRecorder.stop();
    });
  }

  // Convert speech to text using backend API
  async speechToText(audioBlob: Blob): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', this.config.inputLanguage);

    try {
      const response = await fetch('/api/v1/voice/speech-to-text', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Speech-to-text failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        text: result.text,
        language: result.language || this.config.inputLanguage,
        confidence: result.confidence || 0.8
      };

    } catch (error) {
      console.error('Speech-to-text error:', error);
      
      // Fallback: try Web Speech API for English
      if (this.config.inputLanguage === 'en' && 'webkitSpeechRecognition' in window) {
        return this.fallbackWebSpeechAPI(audioBlob);
      }
      
      throw new Error('Speech recognition failed. Please try typing your message.');
    }
  }

  // Fallback Web Speech API for English (Chrome/Edge)
  private async fallbackWebSpeechAPI(_audioBlob: Blob): Promise<TranscriptionResult> {
    return new Promise((_resolve, reject) => {
      // This is a simplified fallback - in practice, Web Speech API 
      // requires real-time audio stream, not recorded blob
      reject(new Error('Web Speech API fallback not implemented for recorded audio'));
    });
  }

  // Convert text to speech and play
  async textToSpeech(text: string): Promise<void> {
    if (!text.trim()) return;

    try {
      const response = await fetch('/api/v1/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          text: text,
          language: this.config.outputLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      await this.playAudio(audioBlob);

    } catch (error) {
      console.error('Text-to-speech error:', error);
      
      // Fallback: try Web Speech Synthesis API
      if ('speechSynthesis' in window) {
        this.fallbackWebSpeechSynthesis(text);
      }
    }
  }

  // Fallback Web Speech Synthesis API
  private fallbackWebSpeechSynthesis(text: string): void {
    try {
      // Stop any currently playing audio first
      this.stopAudio();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.outputLanguage === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      // Track current utterance
      this.currentUtterance = utterance;
      
      // Clear reference when speech ends
      utterance.onend = () => {
        this.currentUtterance = null;
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Web Speech Synthesis fallback failed:', error);
    }
  }

  // Play audio blob
  private async playAudio(audioBlob: Blob): Promise<void> {
    // Stop any currently playing audio first
    this.stopAudio();
    
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      // Track current audio element
      this.currentAudio = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };
      
      audio.src = url;
      audio.play().catch(reject);
    });
  }

  // Cleanup method
  cleanup(): void {
    // Stop any playing audio
    this.stopAudio();
    
    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }
    
    // Close media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;