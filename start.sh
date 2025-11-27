#!/bin/bash

echo "========================================"
echo "Starting EduLegal MERN Application"
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup INT TERM

echo "[1/2] Starting Backend Server (Port 5000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo ""
echo "Waiting 3 seconds for backend to initialize..."
sleep 3

echo ""
echo "[2/2] Starting Frontend Server (Port 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Both servers are running!"
echo ""
echo "Backend: http://localhost:5000/api"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "========================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID











