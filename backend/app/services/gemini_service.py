import google.generativeai as genai
from app.config import settings
from typing import Dict, Any, List
import json

# Configure Gemini AI
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

class GeminiAIService:
    """Service for Gemini AI integration for worker assistance."""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # System prompts for different types of assistance
        self.job_recommendation_prompt = """
        You are an AI assistant specialized in helping contract and informal workers in India.
        Your role is to help workers find suitable jobs based on their skills, location, and preferences.
        
        When recommending jobs, consider:
        - Worker's skills and area of expertise
        - Location preferences and travel distance
        - Minimum wage requirements
        - Previous experience
        - Job urgency and duration
        
        Provide job recommendations with:
        - Job title and description
        - Payment details (fair wage assessment)
        - Location and distance
        - Required skills match percentage
        - Employer rating (if available)
        - Application link or next steps
        
        Be encouraging and supportive. Always prioritize worker safety and fair wages.
        """
        
        self.rights_assistance_prompt = """
        You are an AI assistant specialized in Indian labor laws and worker rights.
        Your role is to help contract and informal workers understand their rights, 
        government schemes, and legal protections.
        
        Areas of expertise:
        - Minimum wage laws by state
        - Working hours regulations
        - Safety requirements
        - Payment terms and timelines
        - Government welfare schemes (MGNREGA, ESI, PF, etc.)
        - Contract labor laws
        - Dispute resolution processes
        - Health and safety regulations
        
        Provide information in simple, clear language. Include:
        - Relevant laws and regulations
        - Worker's specific rights
        - Government schemes they may be eligible for
        - Steps to take if rights are violated
        - Contact information for relevant authorities when needed
        
        Always be supportive and empowering. Help workers understand they have rights and protections.
        """
    
    async def get_job_recommendations(self, user_data: Dict[str, Any], chat_message: str) -> str:
        """Get job recommendations based on user profile and chat message."""
        
        try:
            # Create context from user data
            user_context = f"""
            Worker Profile:
            - Name: {user_data.get('name', 'Worker')}
            - Skills: {', '.join(user_data.get('area_of_expertise', []))}
            - Experience: {user_data.get('experience', {}).get('years_of_experience', 0)} years
            - Location: {user_data.get('location', {}).get('city', '')}, {user_data.get('location', {}).get('state', '')}
            - Minimum wage preference: ₹{user_data.get('preferences', {}).get('minimum_wage', 0)}/day
            - Max travel distance: {user_data.get('preferences', {}).get('max_travel_distance', 0)} km
            - Previous jobs: {', '.join(user_data.get('experience', {}).get('previous_jobs', []))}
            - Additional skills: {', '.join(user_data.get('experience', {}).get('skills', []))}
            """
            
            full_prompt = f"""
            {self.job_recommendation_prompt}
            
            {user_context}
            
            Worker's message: {chat_message}
            
            Please provide helpful job recommendations and guidance based on their profile and message.
            """
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            return f"I apologize, but I'm having trouble connecting to the job recommendation service right now. Please try again later. Error: {str(e)}"
    
    async def get_rights_assistance(self, user_data: Dict[str, Any], chat_message: str) -> str:
        """Get worker rights and legal assistance based on user profile and query."""
        
        try:
            # Create context from user data
            user_context = f"""
            Worker Profile:
            - Location: {user_data.get('location', {}).get('city', '')}, {user_data.get('location', {}).get('state', '')}
            - Work area: {', '.join(user_data.get('area_of_expertise', []))}
            - Experience: {user_data.get('experience', {}).get('years_of_experience', 0)} years
            - Current minimum wage: ₹{user_data.get('preferences', {}).get('minimum_wage', 0)}/day
            """
            
            full_prompt = f"""
            {self.rights_assistance_prompt}
            
            {user_context}
            
            Worker's question: {chat_message}
            
            Please provide helpful information about worker rights, laws, and government schemes 
            relevant to their situation and location in India.
            """
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            return f"I apologize, but I'm having trouble accessing the legal information service right now. Please try again later. Error: {str(e)}"
    
    async def general_assistance(self, user_data: Dict[str, Any], chat_message: str) -> str:
        """General assistance for work-related queries."""
        
        try:
            user_context = f"""
            Worker Profile:
            - Name: {user_data.get('name', 'Worker')}
            - Skills: {', '.join(user_data.get('area_of_expertise', []))}
            - Location: {user_data.get('location', {}).get('city', '')}, {user_data.get('location', {}).get('state', '')}
            """
            
            full_prompt = f"""
            You are an AI assistant for AI FairWork, helping contract and informal workers in India.
            
            You help with:
            1. Finding jobs and work opportunities
            2. Understanding worker rights and labor laws
            3. Information about government welfare schemes
            4. Work logging and payment tracking guidance
            5. General career advice for contract workers
            
            {user_context}
            
            Worker's message: {chat_message}
            
            Provide helpful, encouraging, and practical advice. Keep responses concise and friendly.
            """
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            print(f"Gemini Error Details: {e}")
            raise e
    
    async def analyze_contract_terms(self, contract_data: Dict[str, Any], user_data: Dict[str, Any]) -> str:
        """Analyze contract terms and provide worker-friendly explanation."""
        
        try:
            user_location = user_data.get('location', {})
            state = user_location.get('state', '')
            
            full_prompt = f"""
            You are an AI assistant helping a contract worker understand their job contract terms.
            
            Contract Details:
            - Job Title: {contract_data.get('title', '')}
            - Description: {contract_data.get('description', '')}
            - Payment: ₹{contract_data.get('payment', {}).get('rate', 0)} per {contract_data.get('payment', {}).get('rate_type', 'day')}
            - Duration: {contract_data.get('work_details', {}).get('duration', '')}
            - Working Hours: {contract_data.get('work_details', {}).get('working_hours', '')}
            - Location: {contract_data.get('work_details', {}).get('location', {}).get('address', '')}
            
            Worker's State: {state}
            
            Please analyze this contract and provide:
            1. A simple explanation of the terms
            2. Whether the wage meets minimum wage requirements for {state}
            3. Any potential concerns or red flags
            4. Worker's rights and protections
            5. Advice on whether this is a fair contract
            
            Be honest and protective of the worker's interests.
            """
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            return "I apologize, but I'm having trouble analyzing the contract right now. Please try again later."

# Singleton instance
gemini_service = GeminiAIService()