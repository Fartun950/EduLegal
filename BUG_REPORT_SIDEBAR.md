# Bug Report: Sidebar Navigation Inconsistency

## 🐛 Issue Description
When navigating from `/welcome` to `/settings`, the sidebar navigation items disappear. Only 2 items remain (Submit Complaint, Settings) instead of the expected 4 items (Welcome, Submit Complaint, Resources, Settings).

## 🔍 Root Cause Analysis

### Problem Location
1. **Welcome.jsx** (line 43): Hardcodes `userRole="student"`
2. **Settings.jsx** (line 111): Determines `userRole` from auth context (defaults to `'guest'` for unauthenticated users)

### The Issue Flow

**On `/welcome` page:**
```jsx
<Sidebar userRole="student" />  // Shows studentNavItems (4 items)
```

**On `/settings` page:**
```jsx
const userRole = user?.role || 'guest'  // Unauthenticated = 'guest'
<Sidebar userRole={userRole === 'admin' ? 'admin' : userRole === 'officer' ? 'officer' : 'guest'} />
// Shows guestNavItems (only 2 items)
```

### Sidebar Component Behavior

**studentNavItems** (4 items):
- `/welcome` - Welcome
- `/complaint` - Submit Complaint  
- `/resources` - Resources
- `/settings` - Settings

**guestNavItems** (2 items - INCOMPLETE):
- `/welcome` - Submit Complaint
- `/settings` - Settings
- ❌ Missing: Welcome link
- ❌ Missing: Resources link

## 📊 Impact

**User Experience:**
- Users lose navigation to Welcome and Resources pages when clicking Settings
- Inconsistent navigation experience across pages
- Confusing UX - sidebar items appear/disappear based on route

**Affected Pages:**
- `/welcome` → `/settings` navigation
- Any navigation from Welcome page to Settings

## ✅ Solution

### Option 1: Fix guestNavItems (Recommended)
Update `guestNavItems` in `Sidebar.jsx` to match `studentNavItems` for public routes.

### Option 2: Consistent Role Determination
Make Welcome page use the same role determination logic as Settings page.

### Option 3: Use Route-Based Role
Determine sidebar role based on current route rather than hardcoded values.

## 🔧 Recommended Fix

**Update `Sidebar.jsx`** to fix `guestNavItems`:

```javascript
const guestNavItems = [
  { path: '/welcome', label: 'Welcome', icon: Home },
  { path: '/complaint', label: 'Submit Complaint', icon: FileText },
  { path: '/resources', label: 'Resources', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
]
```

This ensures consistent navigation for unauthenticated users across all public pages.


