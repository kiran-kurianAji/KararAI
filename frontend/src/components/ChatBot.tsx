import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RotateCcw, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '../types';
import { chatAPI } from '../services/api';
import { voiceService, type VoiceRecording } from '../services/voiceService';
import type { AxiosError } from 'axios';

interface ChatBotProps {
  userId: string;
  contractId?: string;
  className?: string;
  sessionType?: 'general' | 'job-analysis';
  onClose?: () => void;
}

const ChatBot = ({ userId, contractId, className = '', sessionType = 'general', onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate session ID for storage
  const sessionId = `chat_${sessionType}_${userId}_${contractId || 'general'}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetChat = () => {
    // Stop any currently playing audio
    voiceService.stopAudio();
    setIsPlaying(false);
    
    // Clear localStorage
    localStorage.removeItem(sessionId);
    
    // Reset messages to welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      senderId: 'ai-assistant',
      message: sessionType === 'job-analysis' 
        ? `Hello! I'm analyzing this job opportunity for you. I can provide insights on:\n\n• Job relevance to your skills\n• Wage fairness and market rates\n• Location and commute analysis\n• Contract terms review\n• Safety and compliance check\n\nWhat would you like me to analyze first?`
        : `Hello! I'm your AI assistant powered by Gemini AI. I can help you with:\n\n• Finding suitable jobs based on your profile\n• Understanding contract terms and fairness\n• Payment tracking and wage analysis\n• Work log management and tips\n• Legal questions about labor rights\n• Government schemes and benefits\n\nWhat would you like to know?`,
      messageType: 'text',
      timestamp: new Date(),
      isRead: true
    };
    setMessages([welcomeMessage]);
  };

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(sessionId);
    if (savedMessages) {
      try {
        const parsedMessages: ChatMessage[] = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        return;
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }

    // Initialize with welcome message if no saved history
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      senderId: 'ai-assistant',
      message: sessionType === 'job-analysis' 
        ? `Hello! I'm analyzing this job opportunity for you. I can provide insights on:\n\n• Job relevance to your skills\n• Wage fairness and market rates\n• Location and commute analysis\n• Contract terms review\n• Safety and compliance check\n\nWhat would you like me to analyze first?`
        : `Hello! I'm your AI assistant powered by Gemini AI. I can help you with:\n\n• Finding suitable jobs based on your profile\n• Understanding contract terms and fairness\n• Payment tracking and wage analysis\n• Work log management and tips\n• Legal questions about labor rights\n• Government schemes and benefits\n\nWhat would you like to know?`,
      messageType: 'text',
      timestamp: new Date(),
      isRead: true
    };
    setMessages([welcomeMessage]);
  }, [sessionId, sessionType]);

  // Initialize voice service
  useEffect(() => {
    const initVoice = async () => {
      if (voiceService.isSupported()) {
        const config = voiceService.getConfig();
        setIsVoiceEnabled(config.enabled);
      }
    };
    initVoice();
  }, []);

  // Voice recording handlers
  const handleVoiceToggle = async () => {
    if (!voiceService.isSupported()) {
      alert('Voice recording is not supported in your browser. Please use Chrome, Edge, or Firefox.');
      return;
    }

    if (!isRecording) {
      try {
        const hasPermission = await voiceService.requestPermission();
        if (!hasPermission) {
          alert('Microphone permission is required for voice input.');
          return;
        }

        await voiceService.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Please check your microphone.');
      }
    } else {
      try {
        const recording: VoiceRecording | null = await voiceService.stopRecording();
        setIsRecording(false);

        if (recording && recording.audioBlob.size > 0) {
          await processVoiceInput(recording);
        } else {
          alert('No audio recorded. Please try again.');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        alert('Failed to process recording. Please try again.');
      }
    }
  };

  const processVoiceInput = async (recording: VoiceRecording) => {
    try {
      setIsTyping(true);
      
      // Convert speech to text
      const transcription = await voiceService.speechToText(recording.audioBlob);
      
      if (transcription.text.trim()) {
        setNewMessage(transcription.text);
        // Auto-send the transcribed message
        setTimeout(() => {
          handleSendMessage(transcription.text);
        }, 500);
      } else {
        alert('Could not understand the audio. Please try speaking more clearly.');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('Voice processing failed. Please try again or type your message.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleLanguageToggle = () => {
    const newEnabled = !isVoiceEnabled;
    
    // Stop any currently playing audio when disabling
    if (!newEnabled) {
      voiceService.stopAudio();
      setIsPlaying(false);
    }
    
    setIsVoiceEnabled(newEnabled);
    
    voiceService.setConfig({
      enabled: newEnabled,
      inputLanguage: 'hi',
      outputLanguage: 'hi'
    });
  };

  const playAIResponse = async (message: string) => {
    if (!isVoiceEnabled || !message.trim()) return;

    try {
      setIsPlaying(true);
      await voiceService.textToSpeech(message);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Silently fail for TTS errors
    } finally {
      setIsPlaying(false);
    }
  };

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(sessionId, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup effect - stop audio on unmount or page reload
  useEffect(() => {
    // Cleanup function
    const cleanup = () => {
      voiceService.stopAudio();
      voiceService.cleanup();
    };

    // Listen for page unload
    const handleBeforeUnload = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || newMessage.trim();
    if (!message) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: userId,
      message,
      messageType: 'text',
      timestamp: new Date(),
      isRead: true,
      contractId
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setNewMessage(''); // Only clear if it's from the input
    setIsTyping(true);

    try {
      console.log('Sending message:', {
        sender_id: userId,
        receiver_id: 'ai-assistant',
        message,
        message_type: 'text',
        contract_id: contractId
      });

      const response = await chatAPI.sendMessage({
        sender_id: userId,
        receiver_id: 'ai-assistant',
        message,
        message_type: 'text',
        contract_id: contractId
      });

      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data.data);
      console.log('AI response object:', response.data.data?.ai_response);
      console.log('AI response message:', response.data.data?.ai_response?.message);

      // Fix response parsing based on backend structure
      let aiResponseText = '';
      if (response.data?.data?.ai_response?.message) {
        aiResponseText = response.data.data.ai_response.message;
      } else if (response.data?.data?.ai_response) {
        aiResponseText = response.data.data.ai_response;
      } else if (response.data?.message) {
        aiResponseText = response.data.message;
      } else {
        aiResponseText = 'I received your message but had trouble generating a response. Please try again.';
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai-assistant',
        message: aiResponseText,
        messageType: 'text',
        timestamp: new Date(),
        isRead: true,
        contractId
      };

      setMessages(prev => [...prev, aiMessage]);

      // Play AI response if voice is enabled
      if (isVoiceEnabled) {
        setTimeout(() => {
          playAIResponse(aiResponseText);
        }, 500);
      }

    } catch (error: unknown) {
      console.error('Chat API error:', error);
      
      const axiosError = error as AxiosError;
      console.error('Error response:', axiosError.response?.data);
      console.error('Error status:', axiosError.response?.status);
      
      let errorMessage = 'Sorry, I encountered an error connecting to the AI service.';
      
      if (axiosError.response?.status === 422) {
        errorMessage = 'There was a validation error with your message. Please try rephrasing.';
      } else if (axiosError.response?.status === 401) {
        errorMessage = 'Authentication error. Please try logging in again.';
      } else if (axiosError.response?.status === 500) {
        errorMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
      }
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai-assistant',
        message: errorMessage + ' \n\nPlease check if the backend server is running.',
        messageType: 'text',
        timestamp: new Date(),
        isRead: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header with Voice Controls and Reset Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-white" />
          <h3 className="text-white font-semibold">
            {sessionType === 'job-analysis' ? 'Job Analysis AI' : 'AI Assistant'}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Hindi Voice Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLanguageToggle}
            className={`px-3 py-1 rounded-lg transition-all duration-200 text-xs font-medium ${
              isVoiceEnabled 
                ? 'bg-green-500 text-white' 
                : 'bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800'
            }`}
            title={`${isVoiceEnabled ? 'Disable' : 'Enable'} Hindi voice input/output`}
          >
            🇮🇳 हिंदी
          </motion.button>

          {/* Voice Recording Button */}
          {voiceService.isSupported() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceToggle}
              disabled={!isVoiceEnabled}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : isVoiceEnabled
                    ? 'bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800'
                    : 'bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
          )}

          {/* Audio Playing Indicator */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-2 bg-blue-500 text-white rounded-lg"
              title="Playing audio response"
            >
              <Volume2 className="w-4 h-4 animate-pulse" />
            </motion.div>
          )}

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetChat}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-lg transition-all duration-200"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${message.senderId === userId ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${message.senderId === userId ? 'ml-2' : 'mr-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.senderId === userId ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}>
                    {message.senderId === userId ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-lg shadow-sm ${
                    message.senderId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.message}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex justify-start"
          >
            <div className="flex mr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {[
            'Find jobs near me',
            'Check payments',
            'Log work hours',
            'My rights'
          ].map((quickAction) => (
            <motion.button
              key={quickAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setNewMessage(quickAction)}
              className="px-3 py-2 text-xs bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all duration-200 shadow-sm"
            >
              {quickAction}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about jobs, contracts, or payments..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-200"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;