# Login Modal Double-Click Fix

## 🐛 Issue Description

When clicking the Legal Officer or Admin link in RoleSwitcher, the login modal requires **two clicks on the X button** to close.

## 🔍 Root Cause Analysis

### Problem: Duplicate LoginModal Instances

**Issue:**
Two `LoginModal` components are being rendered simultaneously:

1. **Welcome Page** (`src/pages/Welcome.jsx` line 166-173)
   - Has its own `LoginModal` instance
   - Opens when `location.state?.showLogin` is true

2. **Header Component** (`src/components/Header.jsx` line 45-52)
   - Also has a `LoginModal` instance
   - Also opens when `location.state?.showLogin` is true
   - Header is used in Welcome page, so both modals render

**Result:**
- Two modals are stacked on top of each other
- Clicking X closes the first modal
- Second modal remains open (requires second click)
- User sees a "double-click" behavior

### Visual Representation

```
┌─────────────────────────────────┐
│   Modal 1 (Welcome Page)        │ ← First X click closes this
│   ┌─────────────────────────┐   │
│   │   Modal 2 (Header)       │   │ ← Second X click closes this
│   │   ┌─────────────────┐   │   │
│   │   │  Login Form     │   │   │
│   │   └─────────────────┘   │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘
```

## ✅ Fix Applied

### Solution: Prevent Header Modal on Welcome Page

**File:** `src/components/Header.jsx`

**Change:**
- Added check to skip opening Header's modal when on Welcome page
- Welcome page already has its own modal, so Header's modal should not open

**Code:**
```javascript
// Before
useEffect(() => {
  if (location.state?.showLogin) {
    setLoginModalOpen(true)
  }
}, [location.state?.showLogin])

// After
useEffect(() => {
  const isWelcomePage = location.pathname === '/welcome' || location.pathname === '/'
  if (location.state?.showLogin && !isWelcomePage) {
    setLoginModalOpen(true)
    // Clear state after opening
    setTimeout(() => {
      const currentState = window.history.state?.usr || location.state
      window.history.replaceState(
        { ...currentState, showLogin: undefined },
        '',
        location.pathname
      )
    }, 0)
  }
}, [location.state?.showLogin, location.pathname])
```

### Additional Fix: Welcome Page State Cleanup

**File:** `src/pages/Welcome.jsx`

**Change:**
- Improved state cleanup to use setTimeout
- Prevents state update during render

## 🎯 How It Works Now

### Scenario: Click Legal Officer from Welcome Page

1. User clicks "Legal Officer" in RoleSwitcher
2. Navigates to `/welcome` with `state: { showLogin: true }`
3. **Welcome page's useEffect** detects `showLogin: true`
   - Opens Welcome's LoginModal ✅
4. **Header's useEffect** detects `showLogin: true`
   - Checks: `isWelcomePage = true`
   - Skips opening Header's modal ✅
5. **Result:** Only ONE modal opens
6. **X button click:** Closes the single modal immediately ✅

### Scenario: Click Legal Officer from Other Pages

1. User on `/resources` page
2. Clicks "Legal Officer" in RoleSwitcher
3. Navigates to `/welcome` with `state: { showLogin: true }`
4. **Welcome page's useEffect** detects `showLogin: true`
   - Opens Welcome's LoginModal ✅
5. **Header's useEffect** detects `showLogin: true`
   - Checks: `isWelcomePage = true` (now on welcome)
   - Skips opening Header's modal ✅
6. **Result:** Only ONE modal opens ✅

## 🧪 Testing Checklist

- [ ] Click "Legal Officer" from Welcome page → Modal opens with single X click to close
- [ ] Click "Admin" from Welcome page → Modal opens with single X click to close
- [ ] Click "Legal Officer" from Resources page → Modal opens with single X click to close
- [ ] Click X button → Modal closes immediately (no double-click needed)
- [ ] Click backdrop → Modal closes immediately
- [ ] Press Escape key → Modal closes immediately

## 📝 Files Modified

1. `src/components/Header.jsx` - Added Welcome page check to prevent duplicate modal
2. `src/pages/Welcome.jsx` - Improved state cleanup timing

## ✅ Expected Behavior

After fix:
- ✅ Only ONE login modal opens
- ✅ Single X click closes the modal
- ✅ Backdrop click closes the modal
- ✅ Escape key closes the modal
- ✅ No more double-click issue

---

*Fix Applied: $(date)*


