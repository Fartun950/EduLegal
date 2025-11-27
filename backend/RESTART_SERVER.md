# How to Restart the Backend Server

## If changes are not reflecting:

### Option 1: Manual Restart (Recommended)

1. **Stop the server:**
   - Press `Ctrl+C` in the terminal where the server is running
   - Wait for it to fully stop

2. **Start the server again:**
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Force Nodemon to Restart

If using nodemon, you can force a restart:
- Press `rs` in the terminal where nodemon is running and press Enter
- Or save any file in the backend directory to trigger auto-restart

### Option 3: Full Restart with Clean

If changes still don't reflect:

1. **Stop all Node processes:**
   ```powershell
   # Kill all node processes (Windows)
   taskkill /F /IM node.exe
   ```

2. **Clear any caches:**
   ```bash
   cd backend
   # Clear npm cache (if needed)
   npm cache clean --force
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### If nodemon is not watching files:

1. **Check nodemon.json exists:**
   - File should be at `backend/nodemon.json`
   - It should watch: controllers, models, routes, middleware, services, config

2. **Verify nodemon is running:**
   - You should see "nodemon" in the terminal output
   - It should show "watching..." messages

3. **Try verbose mode:**
   ```bash
   cd backend
   npm run dev:verbose
   ```
   This will show exactly what files nodemon is watching

### If server won't start:

1. **Check for errors:**
   - Look for error messages in terminal
   - Common issues: missing dependencies, MongoDB connection, syntax errors

2. **Check if port is in use:**
   ```powershell
   # Check what's using port 5000
   netstat -ano | findstr :5000
   ```

3. **Try different port:**
   - Update `PORT` in `backend/.env` file

## Quick Commands

```bash
# Stop server: Ctrl+C

# Restart server:
cd backend
npm run dev

# Check if server is running:
curl http://localhost:5000/api/health
```



