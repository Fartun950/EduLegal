# .env File Verification Checklist

Use this checklist to verify that your `.env` file is correctly configured for the Education Legal System backend.

## 📍 File Location

- [ ] The `.env` file exists in the `backend/` directory (not in the root directory)
- [ ] The file is named exactly `.env` (not `.env.txt`, `.env.example`, etc.)

---

## ✅ Required Environment Variables

These variables are **mandatory** - the application will fail to start without them.

### 1. MONGODB_URI
- [ ] Variable exists in the file
- [ ] Value is not empty
- [ ] Format matches: `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`
- [ ] Contains your actual MongoDB Atlas credentials (not placeholder text)
- [ ] Database name is set (e.g., `edulegal`)
- [ ] No extra spaces or quotes around the value

**Example (replace with your actual values):**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/edulegal?retryWrites=true&w=majority
```

**Common Issues:**
- ❌ Missing connection string → Error: "MONGODB_URI is not defined in environment variables"
- ❌ Invalid format → MongoDB connection will fail
- ❌ Empty value → Connection will fail

---

### 2. JWT_SECRET
- [ ] Variable exists in the file
- [ ] Value is not empty
- [ ] Value is a strong, random string (at least 32 characters recommended)
- [ ] Not using placeholder text like "your-super-secret-jwt-key-change-this-in-production"
- [ ] Value is unique (not shared with other projects)
- [ ] No extra spaces or quotes around the value

**How to generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example:**
```
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Common Issues:**
- ❌ Missing secret → JWT token generation/verification will fail
- ❌ Weak secret (short or predictable) → Security risk
- ❌ Using default/placeholder → Security risk

---

## 🔧 Optional Environment Variables

These variables have default values but can be customized if needed.

### 3. PORT
- [ ] (Optional) Variable exists in the file
- [ ] If present, value is a valid port number (1024-65535)
- [ ] If not present, defaults to 3000

**Example:**
```
PORT=3000
```

**Default:** `3000` (if not specified)

---

### 4. NODE_ENV
- [ ] (Optional) Variable exists in the file
- [ ] If present, value is either `development` or `production`
- [ ] If not present, defaults to `development`

**Example:**
```
NODE_ENV=development
```

**Default:** `development` (if not specified)

**Note:** In production, set this to `production` for optimized error handling.

---

### 5. FRONTEND_URL
- [ ] (Optional) Variable exists in the file
- [ ] If present, value is a valid URL (e.g., `http://localhost:5173`)
- [ ] If not present, defaults to `http://localhost:5173`

**Example:**
```
FRONTEND_URL=http://localhost:5173
```

**Default:** `http://localhost:5173` (if not specified)

**Note:** Update this if your frontend runs on a different URL or port.

---

## 📝 File Format Checklist

- [ ] Each variable is on its own line
- [ ] Format: `VARIABLE_NAME=value` (no spaces around the `=`)
- [ ] No quotes needed around values (unless value contains spaces)
- [ ] No trailing spaces after values
- [ ] Empty lines are allowed (for organization)
- [ ] Comments start with `#` (if you want to add notes)
- [ ] No syntax errors or typos in variable names

**Correct Format Example:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.net/edulegal?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Incorrect Format Examples:**
```env
# ❌ Wrong - spaces around =
MONGODB_URI = mongodb+srv://...

# ❌ Wrong - quotes (usually not needed)
JWT_SECRET="your-secret-key-here"

# ❌ Wrong - missing variable name
=value

# ❌ Wrong - typo in variable name
JWT_SECRETS=value  # Should be JWT_SECRET
```

---

## 🔍 Quick Verification Steps

1. **Check File Location:**
   ```bash
   # Navigate to backend directory
   cd backend
   # Check if .env exists
   ls -la .env  # On Windows: dir .env
   ```

2. **Check Required Variables:**
   ```bash
   # On Linux/Mac
   grep -q "MONGODB_URI" backend/.env && echo "✓ MONGODB_URI found" || echo "✗ MONGODB_URI missing"
   grep -q "JWT_SECRET" backend/.env && echo "✓ JWT_SECRET found" || echo "✗ JWT_SECRET missing"
   ```

3. **Test Backend Start:**
   ```bash
   cd backend
   npm start
   ```
   - ✅ Should see: "MongoDB Atlas Connected" and "Server running on port X"
   - ❌ If you see "MONGODB_URI is not defined" → Missing required variable
   - ❌ If you see connection errors → Check MONGODB_URI format

---

## 🐛 Common Issues and Solutions

### Issue: "MONGODB_URI is not defined"
**Solution:** Add `MONGODB_URI` variable to `backend/.env` file

### Issue: MongoDB connection fails
**Possible Causes:**
- Invalid connection string format
- Wrong credentials in connection string
- Network/firewall blocking MongoDB Atlas
- Database name is incorrect

**Solution:** Verify your MongoDB Atlas connection string in the MongoDB Atlas dashboard

### Issue: JWT authentication fails
**Possible Causes:**
- `JWT_SECRET` is missing or empty
- `JWT_SECRET` was changed after users logged in (existing tokens become invalid)

**Solution:** Ensure `JWT_SECRET` is set and consistent across server restarts

### Issue: CORS errors in frontend
**Possible Causes:**
- `FRONTEND_URL` doesn't match your actual frontend URL
- Port mismatch

**Solution:** Update `FRONTEND_URL` to match your frontend's actual URL and port

---

## ✅ Final Checklist

Before starting the server, ensure:

- [ ] `.env` file exists in `backend/` directory
- [ ] `MONGODB_URI` is set with valid connection string
- [ ] `JWT_SECRET` is set with a strong random string
- [ ] Optional variables are set correctly (or defaults are acceptable)
- [ ] File format is correct (no syntax errors)
- [ ] No sensitive data is committed to Git (`.env` should be in `.gitignore`)

---

## 📚 Reference

For more information, see:
- `backend/SETUP.md` - Backend setup instructions
- `backend/README.md` - Full API documentation
- MongoDB Atlas Documentation - For connection string setup

---

**Last Updated:** Based on codebase analysis of Education Legal System backend













