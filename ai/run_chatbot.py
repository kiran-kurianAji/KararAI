#!/usr/bin/env python3
"""
Simple launcher script for the Multilingual AI Chatbot
"""

import sys
import os

def main():
    """Launch the chatbot with error handling"""
    try:
        # Add current directory to path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        sys.path.insert(0, current_dir)
        
        # Import and run the chatbot
        from multilingual_chatbot import MultilingualChatbot
        
        print("Starting Multilingual AI Chatbot...")
        chatbot = MultilingualChatbot()
        chatbot.run()
        
    except ImportError as e:
        print(f"Error: Missing required package - {e}")
        print("Please run: python setup.py")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting chatbot: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
