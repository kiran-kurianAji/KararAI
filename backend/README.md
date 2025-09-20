# AI FairWork Backend

> Empowering Contract & Informal Workers with AI-powered assistance

## 🎯 Project Overview

AI FairWork is an end-to-end platform that helps contract and informal workers in India by:

- **Finding Jobs**: AI aggregates opportunities from multiple sources
- **Work Logging**: Digital proof of work hours and payments
- **Fair Payment**: Prevents wage disputes with automated tracking
- **Rights & Benefits**: RAG-powered assistance for labor laws and government schemes
- **Health Support**: Symptom logging and health advice

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ installed
- pip package manager

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Update `.env` with:
- `GEMINI_API_KEY`: Your Google Gemini AI API key
- `SECRET_KEY`: A secure random string for JWT tokens

### 3. Initialize Database

```bash
python seed_data.py
```

This will create the SQLite database and populate it with mock data including:
- 3 workers with different expertise
- 3 employers from different industries  
- 3 job posts (published)
- 2 active contracts
- Sample applications

### 4. Start the Server

```bash
python run_server.py
```

The server will start at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register/worker` - Register a new worker
- `POST /api/v1/auth/register/employer` - Register a new employer
- `POST /api/v1/auth/login` - Login (workers & employers)
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout

### Contracts & Jobs

- `GET /api/v1/contracts` - List contracts with filtering
- `POST /api/v1/contracts` - Create contract (employers)
- `GET /api/v1/contracts/{id}` - Get contract details
- `POST /api/v1/contracts/{id}/accept` - Accept contract (workers)
- `GET /api/v1/jobs` - List job posts
- `POST /api/v1/jobs` - Create job post (employers)
- `POST /api/v1/jobs/{id}/apply` - Apply to job (workers)

### AI Chat Assistant

- `POST /api/v1/chat` - Send message to AI assistant
- `GET /api/v1/chat/conversation` - Get chat history

## 🤖 AI Features

### Gemini-Powered Assistant

The AI assistant specializes in:

1. **Job Recommendations**
   - Matches jobs based on skills, location, experience
   - Provides fair wage assessments
   - Includes application guidance

2. **Worker Rights Assistance**
   - Explains labor laws by state
   - Information on government schemes (MGNREGA, ESI, PF)
   - Minimum wage compliance checking
   - Dispute resolution guidance

3. **Contract Analysis**
   - Plain-language explanation of terms
   - Red flag identification
   - Fair wage verification
   - Rights and protections overview

## 🗃️ Database Schema

### Key Models

- **User**: Worker profiles with skills, location, preferences
- **Employer**: Company profiles with verification status
- **Contract**: Work agreements with payment tracking
- **JobPost**: Job opportunities with requirements
- **ContractApplication**: Worker applications to jobs
- **ChatMessage**: AI conversation history
- **WorkLog**: Time tracking and work records
- **PaymentRecord**: Payment history and status

## 🛠️ Mock Data

The seeded database includes realistic Indian worker scenarios:

### Workers
- **Rajesh Kumar**: Construction worker, Bangalore (8 years experience)
- **Priya Sharma**: Domestic helper, Bangalore (5 years experience)  
- **Suresh Reddy**: Electrician/Plumber, Mysore (12 years experience)

### Employers
- **Bangalore Builders**: Construction company
- **Clean Home Services**: Cleaning service provider
- **Tech Park Maintenance**: Facility management

### Sample Jobs
- Construction workers needed for residential building
- Domestic cleaning staff for multiple locations
- Electrical maintenance for tech park

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. Login with phone/email and password
2. Receive JWT token in response
3. Include token in Authorization header: `Bearer <token>`
4. Token expires in 30 minutes (configurable)

## 🌐 Frontend Integration

The frontend should use axios to connect to this backend:

```typescript
// Login example
const response = await axios.post('/api/v1/auth/login', {
  phone_or_email: 'user@example.com',
  password: 'password123'
});

const { access_token, user } = response.data;
localStorage.setItem('authToken', access_token);
```

## 📝 Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///./fairwork.db

# JWT Authentication  
SECRET_KEY=your-super-secret-key-change-in-production

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS (for frontend)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🚦 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

For paginated responses:

```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

## 🔧 Development

### Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/    # API route handlers
│   ├── services/            # Business logic (Gemini AI)
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication utilities
│   └── database.py         # Database connection
├── main.py                 # FastAPI application
├── seed_data.py           # Database seeding script
└── requirements.txt       # Python dependencies
```

### Adding New Features

1. Define database models in `models.py`
2. Create Pydantic schemas in `schemas.py`  
3. Implement API endpoints in `api/v1/endpoints/`
4. Add business logic in `services/`
5. Update the router in `api/v1/api.py`

## 🌟 Key Features Implemented

✅ **Authentication**: Worker & employer registration/login with JWT  
✅ **Job Management**: CRUD operations for jobs and applications  
✅ **Contract System**: Contract creation, acceptance, and tracking  
✅ **AI Assistant**: Gemini-powered chat for job recommendations and rights  
✅ **Payment Tracking**: Work logs and payment records  
✅ **Search & Filtering**: Advanced job search with location, skills, etc.  
✅ **Mock Data**: Realistic Indian worker scenarios for testing  

## 🎯 Social Impact

This platform directly addresses:
- **Exploitation Prevention**: Transparent payment tracking
- **Rights Awareness**: AI-powered legal assistance  
- **Job Access**: Direct connection without middlemen
- **Dignity**: Professional treatment of informal workers
- **Economic Empowerment**: Fair wages and government scheme access

---

**Built with ❤️ for the workers who build our society**