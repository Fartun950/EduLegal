@echo off
echo ========================================
echo Starting EduLegal MERN Application
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "EduLegal Backend" cmd /k "cd backend && npm run dev"

echo.
echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Frontend Server (Port 5173)...
start "EduLegal Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo.
echo Backend: http://localhost:5000/api
echo Frontend: http://localhost:5173
echo.
echo Close these windows to stop the servers.
echo ========================================
pause











