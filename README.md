# Outreach

A cold email generator for internship outreach. Paste company info, get a personalized email.

## Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/Jai2405/Outreach.git
   cd Outreach

   # Backend
   python -m venv venv
   source venv/bin/activate
   pip install flask flask-cors openai python-dotenv

   # Frontend
   cd frontend
   npm install
   ```

2. **Add OpenAI API key**
   ```bash
   echo "OPENAI_API_KEY=your-key-here" > .env
   ```

3. **Run**

   Double-click `start.command` or run manually:
   ```bash
   # Terminal 1 - Backend
   cd backend && source ../venv/bin/activate && python app.py

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

4. Open http://localhost:5173

## Usage

- Paste company info → Generate email
- Edit the system prompt via "Prompt" button to customize your profile
- Use "Open in Outlook" to draft the email directly
