# How to See Your Changes

The changes have been saved to the files. To see them:

## Option 1: Hard Refresh Browser (Easiest)

1. **Open your browser DevTools** (Press F12)
2. **Right-click the refresh button** in your browser
3. **Select "Empty Cache and Hard Reload"** or **"Clear Cache and Hard Reload"**

OR

- Press **Ctrl + Shift + R** (Windows/Linux)
- Press **Ctrl + F5** (Windows)
- Press **Cmd + Shift + R** (Mac)

## Option 2: Restart Development Server

If hard refresh doesn't work:

1. **Stop the current dev server:**
   - Find the terminal where `npm run dev` is running
   - Press **Ctrl + C** to stop it

2. **Restart the dev server:**
   ```bash
   npm run dev
   ```

3. **Clear browser cache:**
   - Open DevTools (F12)
   - Go to Application tab → Clear storage → Clear site data
   - Or use Ctrl + Shift + R to hard refresh

## Option 3: Full Reset

If still not working:

1. **Stop all Node processes:**
   - Close all terminals running node/vite
   - Or kill processes: `taskkill /F /IM node.exe`

2. **Clear node_modules cache** (optional):
   ```bash
   cd frontend (or wherever vite is)
   rm -rf node_modules/.vite
   # Or on Windows:
   rmdir /s /q node_modules\.vite
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Hard refresh browser** (Ctrl + Shift + R)

## What Changed?

- **Welcome page**: Now shows ONLY greeting text and "Submit Complaint" button (removed all other sections)
- **Settings page**: Added "Manage Complaints" section where guests can see and delete their own complaints
- **Sidebar**: Guests now see only "Submit Complaint" and "Settings" (removed Resources)

## Verify You're Seeing Changes

1. Make sure you're logged in as a **guest user** (role: guest)
2. Go to `/welcome` - should see simplified page
3. Go to `/settings` - should see "Manage Complaints" section at the bottom
4. Check sidebar - should only show 2 items for guests

## If Changes Still Don't Show

1. **Check browser console** (F12 → Console tab) for errors
2. **Verify file was saved** - check `src/pages/Welcome.jsx` - should only have 1 Card component
3. **Check network tab** - make sure files are loading from server, not cache
4. **Try incognito/private window** - this bypasses cache



