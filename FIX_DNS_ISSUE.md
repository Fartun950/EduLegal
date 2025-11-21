# Fix DNS/Network Issue for MongoDB Atlas

## Problem
Node.js DNS queries are timing out when trying to connect to MongoDB Atlas.

## Solutions (Try in order):

### Solution 1: Configure Windows DNS (Recommended)

1. Open **Network Settings**:
   - Right-click network icon in system tray → "Open Network & Internet settings"
   - Or: Settings → Network & Internet

2. Change DNS Settings:
   - Click "Change adapter options"
   - Right-click your active network adapter → "Properties"
   - Select "Internet Protocol Version 4 (TCP/IPv4)" → "Properties"
   - Choose "Use the following DNS server addresses"
   - Enter:
     - Preferred: `8.8.8.8` (Google DNS)
     - Alternate: `8.8.4.4` (Google DNS backup)
   - Click OK and restart your computer

3. Test again: `npm run dev`

### Solution 2: Allow Node.js Through Firewall

1. Open **Windows Defender Firewall**
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" → "Allow another app"
4. Browse to: `C:\Program Files\nodejs\node.exe`
5. Check both "Private" and "Public"
6. Click OK

### Solution 3: Use Local MongoDB (Quick Fix)

If DNS issues persist, use local MongoDB:

1. Install MongoDB locally or use Docker
2. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/edulegal
   ```
3. Restart: `npm run dev`

### Solution 4: Check Antivirus/Firewall Software

- Temporarily disable third-party antivirus/firewall
- Test if connection works
- If it works, add Node.js to exceptions

## After Fixing DNS

1. Restart your computer (to apply DNS changes)
2. Run: `npm run dev`
3. The backend should now connect to MongoDB Atlas







