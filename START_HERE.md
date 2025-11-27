# 🚀 EduLegal MERN Project - Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## ⚡ Quick Start (Run Both Servers Together)

### Option 1: Using Start Scripts (Recommended)

#### Windows:
```bash
# Double-click start.bat or run:
start.bat
```

#### Mac/Linux:
```bash
# Make the script executable first:
chmod +x start.sh

# Then run:
./start.sh
```

### Option 2: Manual Start (Two Terminal Windows)

#### Terminal 1 - Backend:
```bash
cd backend
npm install  # Only needed first time
npm run dev
```

#### Terminal 2 - Frontend:
```bash
npm install  # Only needed first time
npm run dev
```

## 📋 First Time Setup

### 1. Install Dependencies

```bash
# Install all dependencies (root + backend)
npm run install:all

# Or manually:
npm install
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables

#### Backend Configuration (`backend/.env`):
```env
# MongoDB Connection - Update with your MongoDB Atlas credentials
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edulegal?retryWrites=true&w=majority

# JWT Secret - Keep this secure
JWT_SECRET=your-jwt-secret-key-here

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration (`.env` in root):
```env
# API Base URL - Points to backend server
VITE_API_URL=http://localhost:5000/api

# Development Environment
NODE_ENV=development
```

### 3. MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at https://www.mongodb.com/cloud/atlas
2. **Create a cluster** (free tier available)
3. **Create a database user**:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Save username and password
4. **Whitelist IP addresses**:
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP address
5. **Get connection string**:
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `edulegal` (or your preferred database name)
   - Update `backend/.env` with your connection string

## 🎯 Verify Everything is Working

### 1. Check Backend Server
- Open: http://localhost:5000/api/health
- Should see: `{"success":true,"message":"EduLegal Backend API is running"}`

### 2. Check Frontend Server
- Open: http://localhost:5173
- Should see the Welcome page

### 3. Test Registration
1. Click "Register" button
2. Fill in name, email, and password
3. Submit form
4. Should see success message and redirect to Welcome page

### 4. Test Login
1. Click "Login" button
2. Enter registered email and password
3. Submit form
4. Should see success message and redirect based on role

## 🔧 Port Configuration

- **Frontend (Vite)**: Port 5173 (configured in `vite.config.js`)
- **Backend (Express)**: Port 5000 (configured in `backend/.env`)

If these ports are in use, you can change them:
- Frontend: Update `vite.config.js` → `server.port`
- Backend: Update `backend/.env` → `PORT` and `.env` → `VITE_API_URL`

## 🐛 Troubleshooting

### Issue: "Network Error" or "Cannot connect to server"

**Solutions:**
1. ✅ Ensure backend server is running on port 5000
2. ✅ Check `VITE_API_URL` in frontend `.env` matches backend port
3. ✅ Verify CORS is enabled in `backend/server.js`
4. ✅ Check backend console for errors

### Issue: "MongoDB connection failed"

**Solutions:**
1. ✅ Verify `MONGODB_URI` in `backend/.env` is correct
2. ✅ Check MongoDB Atlas IP whitelist (Network Access)
3. ✅ Verify database username and password are correct
4. ✅ Ensure connection string format is: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Issue: "Port already in use"

**Solutions:**
1. ✅ Find and stop the process using the port:
   ```bash
   # Windows:
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux:
   lsof -ti:5000 | xargs kill
   ```
2. ✅ Or change the port in configuration files

### Issue: Frontend disappears when backend starts

**Solution:**
- ✅ Use separate terminal windows or the provided start scripts
- ✅ Backend and frontend run independently on different ports
- ✅ They communicate via HTTP requests (frontend → backend)

## 📝 Available Scripts

### Root Package.json:
- `npm run dev` - Start frontend development server
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

### Backend Package.json:
- `npm start` - Start backend server (production mode)
- `npm run dev` - Start backend with nodemon (development mode)

## 🔒 Security Notes

- ⚠️ Never commit `.env` files to git
- ⚠️ Keep `JWT_SECRET` secure and random
- ⚠️ In production, use strong MongoDB passwords
- ⚠️ Restrict MongoDB Atlas IP whitelist in production

## 📞 Need Help?

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is accessible from your IP
4. Check that both servers are running on correct ports

---

**Happy Coding! 🎉**











