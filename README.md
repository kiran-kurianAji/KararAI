# KararAI - Legal Contract Assistant with Voice Support

🤖 **AI-powered legal contract assistant that helps workers understand, analyze, and manage their employment contracts with voice support in Hindi and English.**

## ✨ Features

### Core Features
- 🎤 **Voice Input/Output**: Record questions in Hindi, get responses in Hindi/English
- 🤖 **AI Contract Analysis**: Powered by Google Gemini API for intelligent contract review
- 📄 **Contract Management**: Upload, store, and track employment contracts
- 💬 **Multi-language Chat**: AI assistant supports Hindi and English
- 🔍 **Job Search**: Find and apply to relevant employment opportunities
- 📊 **Digital Ledger**: Track work hours, payments, and expenses

### Voice Features
- **Speech Recognition**: Converts Hindi speech to English text using Google Speech API
- **Text-to-Speech**: Plays AI responses in Hindi using Google TTS
- **Language Toggle**: Switch between Hindi and English voice modes
- **Audio Controls**: Stop audio on reset, language toggle, or page reload
- **Fallback Support**: Web Speech API fallback for enhanced compatibility

### User Management
- 👤 **Worker Profiles**: Detailed skill tracking and work history
- 🏢 **Employer Portal**: Post jobs and manage applications
- 🔐 **Secure Authentication**: JWT-based login system
- 📱 **Responsive Design**: Works on desktop and mobile devices
- **⚖️ Rights & Benefits**: RAG-powered assistance for labor laws and government schemes
- **🏥 Health Support**: Symptom logging and health advice

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js and npm (for frontend development)
- Git (to clone the repository)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd KararAI
```

### 2. Set Environment Variables
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit backend/.env and add your Gemini API key
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Start the Backend (Docker)
**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manual Docker Compose:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### 4. Start the Frontend (Local Development)
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Platform
- **🌐 Backend API**: http://localhost:8000
- **📚 API Documentation**: http://localhost:8000/docs
- **🖥️ Frontend**: http://localhost:5173
- **🏥 Health Check**: http://localhost:8000/health

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  AI FairWork Platform               │
├─────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Tailwind CSS)      │
│  ├── Authentication & User Management               │
│  ├── Job Search & Contract Management               │
│  ├── AI Chat Assistant Interface                    │
│  └── Payment & Work Tracking                        │
├─────────────────────────────────────────────────────┤
│  Backend (FastAPI + SQLAlchemy + SQLite)           │
│  ├── REST API Endpoints                             │
│  ├── JWT Authentication                             │
│  ├── Database Models & Relations                    │
│  └── Business Logic                                 │
├─────────────────────────────────────────────────────┤
│  AI Services (Google Gemini)                       │
│  ├── Job Recommendations                            │
│  ├── Worker Rights Assistance                       │
│  ├── Contract Analysis                              │
│  └── Government Scheme Information                  │
├─────────────────────────────────────────────────────┤
│  Database (SQLite)                                 │
│  ├── Users (Workers & Employers)                    │
│  ├── Jobs & Contracts                               │
│  ├── Applications & Work Logs                       │
│  └── Chat History & Payments                        │
└─────────────────────────────────────────────────────┘
```

## 🤖 AI Features

### Gemini-Powered Assistant

**Job Recommendations:**
```
User: "Looking for construction work in Bangalore"
AI: "I found 3 construction jobs near you:
     1. Residential Building - ₹550/day (Whitefield)
     2. Road Construction - ₹600/day (Electronic City)
     3. House Renovation - ₹500/day (Koramangala)
     
     All jobs meet Karnataka minimum wage requirements."
```

**Worker Rights Assistance:**
```
User: "What is minimum wage in Karnataka?"
AI: "In Karnataka, minimum wage varies by type of work:
     - Construction: ₹538/day
     - Domestic Work: ₹315/day
     - Agricultural: ₹352/day
     
     You're also eligible for these schemes:
     - MGNREGA (100 days guaranteed work)
     - ESI (medical benefits)
     - Building Workers Welfare Fund"
```

**Contract Analysis:**
```
User: "Is this contract fair?" + contract details
AI: "Contract Analysis:
     ✅ Payment rate (₹550/day) meets minimum wage
     ✅ Clear payment terms (weekly)
     ⚠️  No overtime compensation mentioned
     ✅ 8-hour work day specified
     
     This appears to be a fair contract. I recommend 
     clarifying overtime payment before signing."
```

## 🗃️ Database Schema

### Core Models
- **👷 User (Workers)**: Skills, location, experience, preferences
- **🏢 Employer**: Company info, business verification, ratings  
- **📄 Contract**: Work agreements with payment tracking
- **💼 JobPost**: Job opportunities with detailed requirements
- **📝 ContractApplication**: Worker applications to jobs
- **💬 ChatMessage**: AI conversation history
- **⏰ WorkLog**: Time tracking and work records
- **💰 PaymentRecord**: Payment history and status

### Mock Data Included
**Workers:**
- **Rajesh Kumar**: Construction worker, Bangalore (8 years experience)
- **Priya Sharma**: Domestic helper, Bangalore (5 years experience)
- **Suresh Reddy**: Electrician/Plumber, Mysore (12 years experience)

**Employers:**
- **Bangalore Builders**: Construction company
- **Clean Home Services**: Cleaning service provider  
- **Tech Park Maintenance**: Facility management

## 🔐 Authentication & Security

- **JWT-based authentication** for secure API access
- **Role-based access control** (Workers vs Employers)
- **Password hashing** with bcrypt
- **Token expiration** and refresh handling
- **CORS configuration** for frontend integration

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register/worker` - Worker registration
- `POST /api/v1/auth/register/employer` - Employer registration
- `POST /api/v1/auth/login` - Login (both user types)
- `GET /api/v1/auth/me` - Get current user profile

### Jobs & Contracts
- `GET /api/v1/jobs` - Browse job posts with filters
- `POST /api/v1/jobs` - Create job post (employers)
- `POST /api/v1/jobs/{id}/apply` - Apply to job (workers)
- `GET /api/v1/contracts` - List contracts with filtering
- `POST /api/v1/contracts/{id}/accept` - Accept contract

### AI Assistant
- `POST /api/v1/chat` - Send message to AI assistant
- `GET /api/v1/chat/conversation` - Get chat history

## 🛠️ Development Setup

### Backend Only (Docker)
```bash
# Start backend with Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# View logs
docker-compose logs -f backend

# Stop backend
docker-compose down
```

### Frontend Only (Local Development)
```bash
cd frontend
npm install
npm run dev                  # Start development server
```

### Both Backend & Frontend
```bash
# Terminal 1: Start backend
./start.sh   # or start.bat on Windows

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
```

### Environment Variables
```bash
# backend/.env
DATABASE_URL=sqlite:///./fairwork.db
SECRET_KEY=your-super-secret-key
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🌟 Key Features Implemented

### ✅ User Management
- Worker and employer registration with detailed profiles
- Profile verification and rating systems
- Authentication with JWT tokens

### ✅ Job System
- Job posting with detailed requirements and payment terms
- Advanced search and filtering by location, skills, wage
- Application system with custom proposals

### ✅ Contract Management  
- Automatic contract generation from job applications
- Work tracking with time logs and progress monitoring
- Payment tracking with transparent records

### ✅ AI Assistant
- Personalized job recommendations based on profile
- Worker rights and legal information by state
- Contract analysis in plain language
- Government scheme eligibility guidance

### ✅ Payment & Work Tracking
- Digital work logs with employer approval
- Payment records with status tracking
- Fair wage compliance checking
- Expense tracking for reimbursements

## 🎯 Social Impact

This platform directly addresses:

- **📈 Economic Empowerment**: Direct job access without middlemen
- **⚖️ Rights Protection**: AI-powered legal assistance and awareness
- **🛡️ Exploitation Prevention**: Transparent payment and work tracking
- **🎓 Education**: Government scheme and benefits awareness
- **🏥 Health Support**: Work-related health monitoring

## 🔄 Production Deployment

### Environment Setup
1. Update environment variables for production
2. Use a production-grade database (PostgreSQL recommended)
3. Set up proper secrets management
4. Configure SSL/TLS certificates
5. Set up monitoring and logging

### Docker Production (Backend Only)
```bash
# Use production docker-compose
docker-compose up -d

# Or build for production
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Deployment
Deploy the frontend to any static hosting service:
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to Vercel, Netlify, etc.
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for the millions of contract workers who are the backbone of our economy
- Powered by Google Gemini AI for intelligent assistance
- Designed with dignity, fairness, and empowerment in mind

---

**🏗️ Empowering the workers who build our society with AI-powered support, transparency, and dignity.**