# Role Switcher Integration Guide

## Overview

The Role Switcher component has been integrated into all major pages of the EduLegal System, allowing users to seamlessly switch between Admin, Legal Officer, and Student dashboards.

## Component Location

- **File**: `src/components/RoleSwitcher.jsx`
- **CSS Utilities**: Added to `src/index.css`

## Features

### Visual Design
- **Horizontal Scrollable**: Smooth horizontal scrolling on smaller screens
- **Color-Coded Roles**:
  - Admin: Purple theme
  - Legal Officer: Blue theme
  - Student: Green theme
- **Active State**: 
  - Highlighted with role-specific color
  - Scale animation (105%)
  - Ring effect for emphasis
  - Pulsing dot indicator
- **Hover Effects**: Subtle scale on hover for inactive roles

### Functionality
- **Auto-Detection**: Automatically detects current role based on URL path
- **Navigation**: Clicking a role navigates to the corresponding dashboard
- **State Management**: Tracks active role and updates on route changes
- **Responsive**: Works seamlessly on mobile, tablet, and desktop

## Integration Points

### 1. Legal Officer Layout
- **File**: `src/layouts/LegalOfficerLayout.jsx`
- **Position**: Above Header component
- **Usage**: All Legal Officer pages inherit this layout

### 2. Admin Dashboard
- **File**: `src/pages/AdminDashboard.jsx`
- **Position**: Above Header component
- **Direct Integration**: Added to page structure

### 3. Student Pages
- **Welcome**: `src/pages/Welcome.jsx`
- **Complaint Form**: `src/pages/StudentComplaintForm.jsx`
- **Position**: Above Header component in both states (form and submitted)

## Routes Mapping

| Role | Route | Icon |
|------|-------|------|
| Admin | `/admin` | Shield |
| Legal Officer | `/officer` | User |
| Student | `/welcome` | GraduationCap |

## Styling Details

### Active Role Button
```css
- Background: Role-specific color (purple/blue/green)
- Text: White
- Border: Role-specific color
- Shadow: Large shadow with ring effect
- Scale: 105%
- Animation: Pulsing dot indicator
```

### Inactive Role Button
```css
- Background: Light role-specific color
- Text: Dark role-specific color
- Border: Light role-specific color
- Shadow: Small shadow
- Hover: Scale to 102%
```

## Responsive Behavior

- **Desktop**: All roles visible, no scrolling needed
- **Tablet**: All roles visible, slight scrolling if needed
- **Mobile**: Horizontal scrollable container, smooth scrolling

## CSS Utilities Added

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scale-102 {
  transform: scale(1.02);
}
```

## Usage Example

```jsx
import RoleSwitcher from '../components/RoleSwitcher'

// In your layout or page component
<div className="flex-1 lg:ml-64 flex flex-col">
  <RoleSwitcher />
  <Header title="..." />
  <main>
    {/* Your content */}
  </main>
</div>
```

## Benefits

1. **Seamless Navigation**: Quick access to all role dashboards
2. **Visual Feedback**: Clear indication of current role
3. **User Experience**: Intuitive role switching without page reload
4. **Consistency**: Same switcher across all pages
5. **Accessibility**: Clear labels and visual indicators

## Future Enhancements

- Add role-specific permissions check
- Show role-specific badge/indicator
- Add keyboard navigation support
- Add role switching animation
- Store last visited role in localStorage














