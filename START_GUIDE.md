# EduLegal MERN Project - Start Guide

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - The `.env` file should already exist with:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - Secret key for JWT tokens
     - `PORT=5000` - Backend server port
     - `FRONTEND_URL=http://localhost:5173` - Frontend URL for CORS

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   **Expected output:**
   ```
   ✅ MongoDB Atlas Connected: cluster0.xxxxx.mongodb.net
   🚀 Server running on port 5000
   📡 Environment: development
   🔗 API Base URL: http://localhost:5000/api
   ```

### Step 2: Frontend Setup

1. **Navigate to root directory** (if not already there):
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - The `.env` file should already exist with:
     - `VITE_API_URL=http://localhost:5000/api` - Backend API URL
     - `NODE_ENV=development`

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   **Expected output:**
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

### Step 3: Access the Application

- **Frontend:** Open http://localhost:5173 in your browser
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Running Both Servers Together

### Option 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Using PowerShell (Windows)

**Backend (in background):**
```powershell
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
```

**Frontend:**
```powershell
npm run dev
```

## Port Configuration

- **Backend:** Port 5000 (configured in `backend/.env`)
- **Frontend:** Port 5173 (Vite default, configured in `vite.config.js`)

If these ports are in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically try the next available port (or change in `vite.config.js`)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (public)
- `POST /api/auth/login` - Login user (public)
- `GET /api/auth/me` - Get current user (protected)

### Cases
- `GET /api/cases` - Get all cases (protected)
- `POST /api/cases` - Create new case (protected)
- `GET /api/cases/:id` - Get case by ID (protected)
- `PUT /api/cases/:id` - Update case (protected)

### Health Check
- `GET /api/health` - Server status (public)

## MongoDB Atlas Setup

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Important Settings

1. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs) OR your specific IP
   - Click "Add IP Address"

2. **Database User:**
   - Go to MongoDB Atlas → Database Access
   - Create a database user with read/write permissions
   - Use this username and password in your connection string

3. **Connection String:**
   - Go to MongoDB Atlas → Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<username>` and `<password>` with your database user credentials
   - Replace `<database>` with your database name (e.g., `edulegal`)

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `backend/.env`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check if port 5000 is already in use
- Look for error messages in terminal

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` file
- Verify CORS settings in `backend/server.js`
- Check browser console for specific error messages

### Registration/Login fails
- Check backend is running
- Verify MongoDB connection is successful
- Check network tab in browser DevTools
- Look at backend terminal for error messages
- Ensure `.env` files are configured correctly

### Port conflicts
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `vite.config.js` or use the port Vite suggests

## Testing the Application

1. **Start both servers** (backend and frontend)

2. **Test Backend Health:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"success":true,"message":"EduLegal Backend API is running"}`

3. **Test Registration:**
   - Open http://localhost:5173
   - Click "Register"
   - Fill in name, email, password
   - Submit form
   - Should redirect to welcome page on success

4. **Test Login:**
   - Click "Login"
   - Enter registered email and password
   - Should redirect to appropriate dashboard based on role

## Project Structure

```
Education-legal-sys/
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── models/
│   │   └── User.js        # User model
│   ├── routes/
│   │   ├── auth.js        # Auth routes
│   │   └── cases.js       # Case routes
│   ├── .env               # Backend environment variables
│   ├── package.json
│   └── server.js          # Backend entry point
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── context/           # React context
│   └── utils/             # Utility functions
├── .env                   # Frontend environment variables
├── vite.config.js         # Vite configuration
└── package.json           # Frontend dependencies
```

## Support

If you encounter issues:
1. Check error messages in terminal (backend) and browser console (frontend)
2. Verify all `.env` files are configured correctly
3. Ensure MongoDB Atlas is accessible and IP is whitelisted
4. Check that both servers are running on correct ports
5. Review the troubleshooting section above

