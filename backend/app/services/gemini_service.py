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
        
        self.job_analysis_prompt = """
        You are an AI assistant specialized in personalized job analysis for contract and informal workers in India.
        Provide CONCISE, focused analysis with key metrics and actionable insights.
        
        Format your response as follows (keep each section brief):
        
        **🎯 Recommendation:** [Highly Recommended/Recommended/Not Recommended] - [one line reason]
        
        **🔧 Skills Match:** [X]% ([X/Y] skills match)
        • ✅ Matching: [list 2-3 key skills]
        • ❌ Missing: [list main gaps]
        
        **💰 Wage Analysis:** ₹[amount]/[period] 
        • [X]% of your minimum (₹[your_min])
        • Fairness: [score]/10 - [Fair/Good/Excellent]
        
        **📍 Location:** [distance] from your location
        • Commute: [Local/Moderate/Long distance]
        • Cost impact: [Low/Medium/High]
        
        **⚠️ Key Concerns:**
        • [List 2-3 main issues if any]
        
        **✅ Next Steps:**
        • [2-3 specific actionable recommendations]
        
        Keep total response under 200 words. Focus on metrics, numbers, and clear recommendations.
        Use markdown formatting with **bold** for emphasis.
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
            
            Provide CONCISE, helpful responses (under 150 words) using markdown formatting.
            Use **bold** for important points, bullet points for lists.
            
            You help with:
            1. Finding jobs and work opportunities
            2. Understanding worker rights and labor laws
            3. Information about government welfare schemes
            4. Work logging and payment tracking guidance
            5. General career advice for contract workers
            
            {user_context}
            
            Worker's message: {chat_message}
            
            Provide helpful, encouraging, and practical advice. Keep responses concise and friendly.
            Use markdown formatting like **bold text** and bullet points.
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
    
    async def analyze_job_opportunity(self, job_data: Dict[str, Any], user_data: Dict[str, Any], user_question: str = "") -> str:
        """Provide comprehensive analysis of a specific job opportunity against user profile."""
        
        try:
            # Extract user profile information
            user_skills = user_data.get('area_of_expertise', []) + user_data.get('experience', {}).get('skills', [])
            user_location = user_data.get('location', {})
            user_preferences = user_data.get('preferences', {})
            user_experience = user_data.get('experience', {})
            
            # Extract job information
            job_title = job_data.get('title', '')
            job_description = job_data.get('description', '')
            required_skills = job_data.get('requirements', {}).get('skills', [])
            job_payment = job_data.get('payment', {})
            job_location = job_data.get('workDetails', {}).get('location', {})
            job_duration = job_data.get('workDetails', {}).get('duration', '')
            job_hours = job_data.get('workDetails', {}).get('workingHours', '')
            employer_info = job_data.get('employer', {})
            fairness_score = job_data.get('fairnessScore', 0)
            
            # Calculate skills match
            matching_skills = []
            for req_skill in required_skills:
                for user_skill in user_skills:
                    if req_skill.lower() in user_skill.lower() or user_skill.lower() in req_skill.lower():
                        matching_skills.append(req_skill)
                        break
            
            skills_match_percentage = (len(matching_skills) / len(required_skills) * 100) if required_skills else 0
            
            analysis_prompt = f"""
            {self.job_analysis_prompt}
            
            **JOB OPPORTUNITY:**
            - Title: {job_title}
            - Description: {job_description}
            - Required Skills: {', '.join(required_skills)}
            - Payment: ₹{job_payment.get('rate', 0)} per {job_payment.get('rateType', 'day')}
            - Payment Terms: {job_payment.get('paymentTerms', 'Not specified')}
            - Duration: {job_duration}
            - Working Hours: {job_hours}
            - Location: {job_location.get('address', '')}, {job_location.get('city', '')}, {job_location.get('state', '')}
            - Employer: {employer_info.get('name', 'Not specified')} (Rating: {employer_info.get('rating', 0)}/5)
            - Fairness Score: {fairness_score}/10
            
            **WORKER PROFILE:**
            - Name: {user_data.get('name', 'Worker')}
            - Skills & Expertise: {', '.join(user_skills)}
            - Experience: {user_experience.get('yearsOfExperience', 0)} years
            - Previous Jobs: {', '.join(user_experience.get('previousJobs', []))}
            - Location: {user_location.get('city', '')}, {user_location.get('state', '')}, PIN: {user_location.get('pincode', '')}
            - Minimum Wage Expectation: ₹{user_preferences.get('minimumWage', 0)}/day
            - Max Travel Distance: {user_preferences.get('maxTravelDistance', 0)} km
            - Preferred Working Hours: {', '.join(user_preferences.get('preferredWorkingHours', []))}
            
            **CALCULATED METRICS:**
            - Skills Match: {len(matching_skills)}/{len(required_skills)} skills ({skills_match_percentage:.1f}%)
            - Matching Skills: {', '.join(matching_skills)}
            - Missing Skills: {', '.join([skill for skill in required_skills if skill not in matching_skills])}
            
            **USER'S SPECIFIC QUESTION:**
            {user_question if user_question else "Provide a comprehensive analysis of this job opportunity for me."}
            
            Please provide a thorough, personalized analysis of this job opportunity specifically for this worker.
            Consider their skills, location, preferences, experience, and the job requirements.
            Be honest about both opportunities and concerns.
            """
            
            response = self.model.generate_content(analysis_prompt)
            return response.text
            
        except Exception as e:
            print(f"Job Analysis Error: {e}")
            return f"I apologize, but I'm having trouble analyzing this job opportunity right now. Please try again later. Error details: {str(e)}"

# Singleton instance
gemini_service = GeminiAIService()