# KararAI Frontend

AI-powered legal contract assistant with voice support in Hindi and English.

## Features

- 🤖 AI-powered chatbot using Gemini API
- 🎤 Voice input/output with Hindi-English translation
- 📄 Contract analysis and search
- 🏢 Employer portal and job listings
- 👤 User authentication and profiles

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API calls
- React Router for navigation

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

## Environment Variables

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_GEMINI_API_KEY` - Google Gemini API key

## Voice Features

- **Speech Recognition:** Converts Hindi speech to English text
- **Text-to-Speech:** Plays AI responses in Hindi
- **Language Toggle:** Switch between Hindi and English voice modes
- **Audio Controls:** Stop audio on reset, language toggle, or page reload