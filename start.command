#!/bin/bash

# Outreach Startup Script
# Double-click this file to start both backend and frontend

cd "$(dirname "$0")"

# Load nvm for node/npm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

echo "Starting Outreach..."
echo ""

# Start backend
echo "Starting backend on port 5000..."
cd backend
source ../venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 2

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
sleep 3

# Open browser
open http://localhost:5173

echo ""
echo "Outreach is running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# Keep running until Ctrl+C
wait $BACKEND_PID $FRONTEND_PID
