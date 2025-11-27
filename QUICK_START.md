# Quick Start Guide

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Available Routes

- **`/welcome`** - Student welcome page
- **`/admin`** - Admin dashboard (full case management)
- **`/officer`** - Legal officer dashboard
- **`/officer/case/:id`** - Case details page (try `/officer/case/C001`)
- **`/complaint`** - Student complaint submission form
- **`/settings`** - User settings page

## Testing Different User Roles

The sidebar navigation adapts based on the `userRole` prop:
- `userRole="admin"` - Shows admin navigation
- `userRole="officer"` - Shows legal officer navigation  
- `userRole="student"` - Shows student navigation

## Key Features to Test

### Admin Dashboard
- View case statistics and charts
- Assign officers to cases
- Update case status
- Export/print reports

### Legal Officer Dashboard
- View assigned cases
- Click "View Details" to see case details
- Access confidential forum

### Student Complaint Form
- Fill out complaint form
- Toggle anonymous submission
- Upload supporting documents
- Submit and see confirmation

## Responsive Design

- **Mobile**: Sidebar collapses, hamburger menu appears
- **Tablet**: Sidebar visible, responsive grid layouts
- **Desktop**: Full sidebar, optimized layouts

## Next Steps for Backend Integration

1. Replace mock data with API calls
2. Add authentication/authorization
3. Connect forms to backend endpoints
4. Implement real file upload
5. Add state management (Redux/Context) if needed

















