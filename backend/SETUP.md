# Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important:**
- Replace `<username>`, `<password>`, `<cluster>`, and `<database>` in `MONGO_URI` with your actual MongoDB Atlas connection details
- Replace `JWT_SECRET` with a strong random string (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3000`

### 4. Test the API

**Health Check:**
```bash
GET http://localhost:3000/api/health
```

**Register a User:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB Atlas connection
├── models/
│   ├── User.js               # User model (admin, legalOfficer, guest)
│   └── Case.js               # Case model
├── routes/
│   ├── auth.js               # Authentication routes
│   └── cases.js              # Case routes
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── caseController.js     # Case management logic
├── middleware/
│   ├── auth.js               # JWT authentication
│   └── roles.js              # Role-based access control
├── .env                      # Environment variables (create this)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── package.json              # Dependencies
├── server.js                 # Main server file
└── README.md                 # Full documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register (defaults to guest role)
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user (protected)

### Cases
- `GET /api/cases/categories` - Get categories (public)
- `POST /api/cases` - Create case (requires auth - all roles)
- `GET /api/cases` - Get all cases (admin/legalOfficer only)
- `GET /api/cases/:id` - Get case by ID (admin/legalOfficer only)
- `PUT /api/cases/:id` - Update case (admin/legalOfficer only)
- `DELETE /api/cases/:id` - Delete case (admin/legalOfficer only)

## Role-Based Access

- **Guest** (default): Can only create/submit cases. Cannot view, edit, update, or delete cases.
- **Legal Officer**: Full access to all case operations.
- **Admin**: Full access to all case operations.

## Next Steps

1. Connect your React frontend to `http://localhost:3000/api`
2. Use the JWT token from login in Authorization header: `Bearer <token>`
3. Test all endpoints with Postman or similar tool
4. Deploy to production when ready







