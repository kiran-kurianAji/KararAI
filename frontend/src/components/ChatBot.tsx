import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatBotProps {
  userId: string;
  contractId?: string;
  className?: string;
}

const ChatBot = ({ userId, contractId, className = '' }: ChatBotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      senderId: 'ai-assistant',
      message: `Hello! I'm your AI assistant. I can help you with:\n\n• Finding suitable jobs\n• Understanding contract terms\n• Payment tracking\n• Work log management\n• Legal questions about labor rights\n\nWhat would you like to know?`,
      messageType: 'text',
      timestamp: new Date(),
      isRead: true
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();

    // Job-related queries
    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('contract')) {
      if (lowerMessage.includes('find') || lowerMessage.includes('search')) {
        return "I can help you find jobs! Based on your profile:\n\n• Construction jobs within 25km of your location\n• Carpentry work matching your skills\n• Projects paying above your minimum wage (₹500/day)\n\nWould you like me to show you some specific opportunities or help you refine your search criteria?";
      }
      if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
        return "To apply for a job:\n\n1. Make sure your profile is complete and verified\n2. Review the job requirements carefully\n3. Check the fairness score (aim for 7+ rating)\n4. Click 'Apply' on jobs that match your skills\n\nRemember: Only apply to jobs with minimum wage compliance. Would you like me to explain what to look for in a good contract?";
      }
    }

    // Payment-related queries
    if (lowerMessage.includes('payment') || lowerMessage.includes('money') || lowerMessage.includes('salary')) {
      return "For payment tracking:\n\n• All payments are recorded in your digital ledger\n• You can upload payment proofs (screenshots/SMS)\n• Track pending payments and raise disputes if needed\n• Generate payment receipts for your records\n\nCurrent status: You have ₹8,000 pending from your active contract. Need help with anything specific?";
    }

    // Legal/Rights queries
    if (lowerMessage.includes('legal') || lowerMessage.includes('rights') || lowerMessage.includes('minimum wage')) {
      return "Your labor rights include:\n\n• Minimum wage protection (varies by state)\n• Safe working conditions\n• Timely payment as per contract terms\n• Right to raise disputes\n\nIn Karnataka, current minimum wage is ₹458/day for construction work. Always check if jobs meet legal requirements before applying. Need specific legal guidance?";
    }

    // Work log queries
    if (lowerMessage.includes('hours') || lowerMessage.includes('log') || lowerMessage.includes('time')) {
      return "Work logging is important for:\n\n• Accurate payment calculation\n• Dispute resolution\n• Building your work history\n• Performance tracking\n\nYou can log hours daily in your active contracts. Today you've logged 6 hours. Don't forget to update when you finish work!";
    }

    // Profile/Verification queries
    if (lowerMessage.includes('profile') || lowerMessage.includes('verification') || lowerMessage.includes('verify')) {
      return "Your profile status:\n\n✅ Basic info complete\n✅ Skills and experience added\n✅ Digital ID verified\n✅ Account active\n\nYou can apply to all available jobs. To improve your profile:\n• Add more skills\n• Complete more jobs to increase rating\n• Add work samples if applicable";
    }

    // Default responses
    const defaultResponses = [
      "I understand you're asking about that. Could you provide more specific details so I can help you better?",
      "That's a good question! Let me help you with that. Can you tell me more about what specifically you need assistance with?",
      "I'm here to help with job-related questions, contracts, payments, and work logging. What would you like to know more about?",
      "Thanks for reaching out! I can assist with finding jobs, understanding contracts, tracking payments, or answering questions about your rights. What's on your mind?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: userId,
      message: newMessage.trim(),
      messageType: 'text',
      timestamp: new Date(),
      isRead: true,
      contractId
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(userMessage.message);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai-assistant',
        message: aiResponse,
        messageType: 'text',
        timestamp: new Date(),
        isRead: true,
        contractId
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai-assistant',
        message: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
        messageType: 'text',
        timestamp: new Date(),
        isRead: true
      };
      setMessages(prev => [...prev, errorMessage]);
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
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${message.senderId === userId ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.senderId === userId ? 'ml-2' : 'mr-2'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  message.senderId === userId ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {message.senderId === userId ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Message Bubble */}
              <div
                className={`px-3 py-2 rounded-lg ${
                  message.senderId === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
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
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex mr-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-[85%]">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {[
            'Find jobs near me',
            'Check payments',
            'Log work hours',
            'My rights'
          ].map((quickAction) => (
            <button
              key={quickAction}
              onClick={() => setNewMessage(quickAction)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {quickAction}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about jobs, contracts, or payments..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;