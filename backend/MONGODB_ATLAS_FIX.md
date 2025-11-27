# MongoDB Atlas Connection Troubleshooting Guide

## Common Issues and Fixes

### 🔴 Issue: Connection Timeout

**Symptoms:**
- Error message: "MongooseServerSelectionError: connect ETIMEDOUT"
- Server hangs and eventually times out

**Fixes:**

1. **Check if Cluster is Paused**
   - Log into [MongoDB Atlas](https://cloud.mongodb.com)
   - Go to **Clusters** → Check if cluster shows "Resume" button
   - If paused, click **Resume** and wait 1-2 minutes

2. **Add IP Address to Whitelist**
   - Go to **Network Access** → **IP Access List**
   - Click **Add IP Address**
   - For development: Add `0.0.0.0/0` (allows all IPs) - **Warning: Only for development!**
   - Or add your current IP address (check at https://whatismyipaddress.com)
   - Wait 1-2 minutes for changes to take effect

3. **Verify Connection String**
   - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
   - Make sure username and password are URL-encoded (special characters should be encoded)
   - Check that cluster name matches your actual cluster

### 🔴 Issue: Authentication Failed

**Symptoms:**
- Error message: "Authentication failed" or "bad auth"

**Fixes:**

1. **Check Database User Credentials**
   - Go to **Database Access** → Check username exists
   - Reset password if needed
   - Make sure user has correct privileges

2. **Update Connection String**
   - If you changed the password, update `MONGO_URI` in `backend/.env`
   - URL-encode special characters in password (e.g., `@` becomes `%40`)

### 🔴 Issue: DNS/Network Error

**Symptoms:**
- Error message: "ENOTFOUND" or "getaddrinfo ENOTFOUND"

**Fixes:**

1. **Check Internet Connection**
   - Test: `ping cluster0.xxxxx.mongodb.net`

2. **Verify Cluster URL**
   - Check MongoDB Atlas → Clusters → **Connect** → Check the connection string
   - Ensure cluster name matches exactly

### 🔴 Issue: Invalid Connection String Format

**Symptoms:**
- Error message: "Invalid connection string" or "invalid schema"

**Fixes:**

1. **Verify .env File Format**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edulegal?retryWrites=true&w=majority
   ```
   - No quotes around the value
   - No spaces before or after the `=`
   - Password should be URL-encoded if it contains special characters

2. **Get Correct Connection String**
   - MongoDB Atlas → Clusters → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<database>` with `edulegal` (or your database name)

## Quick Diagnostic Steps

1. **Test Connection String Directly:**
   ```bash
   mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edulegal"
   ```

2. **Check Environment Variables:**
   ```bash
   cd backend
   node -e "import('./config/env.js').then(m => console.log('MONGO_URI:', m.ENV.MONGO_URI))"
   ```

3. **Verify Cluster Status:**
   - Log into MongoDB Atlas
   - Check if cluster is "Running" (not "Paused")

4. **Test with MongoDB Compass:**
   - Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
   - Try connecting with the same connection string
   - If Compass works but your app doesn't, it's likely an IP whitelist issue

## Example .env File

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/edulegal?retryWrites=true&w=majority

# Database Name
DB_NAME=edulegal

# Server Port
PORT=5000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Still Having Issues?

1. Check MongoDB Atlas Status: https://status.mongodb.com
2. Review MongoDB Atlas Logs: Atlas → Clusters → Metrics
3. Verify your account isn't suspended
4. Check if you've reached connection limits (free tier has limits)

