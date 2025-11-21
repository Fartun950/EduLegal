# EduLegal System

A complete, responsive React UI for an EduLegal System built with Tailwind CSS and React Router. This system provides comprehensive legal management capabilities for educational institutions.

## Features

### Admin Dashboard
- **Case Overview**: Visual cards displaying total cases, open cases, closed cases, and notifications
- **Statistics Charts**: Interactive bar charts showing case trends over time
- **Cases Table**: Complete table of all cases with filtering and sorting capabilities
- **Case Management**: Assign legal officers to cases, update case status
- **Export/Print**: Generate reports and export case data

### Legal Officer Dashboard
- **Assigned Cases**: View all cases assigned to the officer
- **Case Details Page**: Comprehensive case information including:
  - Case description and timeline
  - Student information
  - Document management
  - Confidential forum for internal discussions
- **Quick Actions**: Update status, add documents, schedule meetings

### Student Complaint Form
- **Anonymous Submission**: Option to submit complaints anonymously
- **File Upload**: Support for multiple file attachments (PDF, DOC, images)
- **Form Validation**: Real-time validation with error messages
- **Confirmation**: Success message with next steps information
- **Category Selection**: Organized complaint categories

### Reusable Components
- **Cards**: Flexible card component with optional titles and actions
- **Tables**: Responsive table component with customizable rows
- **Buttons**: Multiple variants (primary, secondary, danger, outline, ghost)
- **Modals**: Full-featured modal dialogs with overlay
- **Sidebars**: Responsive navigation sidebar with role-based menus
- **Charts**: Bar charts, pie charts, and line charts using Recharts

## Tech Stack

- **React 18**: Modern React with hooks
- **React Router 6**: Client-side routing
- **Tailwind CSS 3**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization
- **Lucide React**: Modern icon library
- **Vite**: Fast build tool and dev server

## Project Structure

```
Education-legal-sys/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Chart.jsx
│   │   ├── Header.jsx
│   │   ├── Modal.jsx
│   │   ├── Sidebar.jsx
│   │   └── Table.jsx
│   ├── pages/               # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── CaseDetails.jsx
│   │   ├── LegalOfficerDashboard.jsx
│   │   ├── Settings.jsx
│   │   ├── StudentComplaintForm.jsx
│   │   └── Welcome.jsx
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Routes

- `/` - Redirects to `/welcome`
- `/welcome` - Student welcome page with resources
- `/admin` - Admin dashboard
- `/officer` - Legal officer dashboard
- `/officer/case/:id` - Case details page
- `/complaint` - Student complaint submission form
- `/settings` - User settings page

## Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebar on mobile devices
- Responsive grid layouts
- Touch-friendly interface elements
- Optimized for tablets and desktops

## Design Features

- **Clean & Modern**: Minimalist design with smooth transitions
- **Consistent Color Scheme**: Blue primary color with semantic colors for status
- **Accessible**: Proper contrast ratios and keyboard navigation
- **Smooth Animations**: CSS transitions for better UX
- **Professional**: Production-ready UI components

## Integration Ready

The codebase is structured to easily integrate with a backend API:
- Form submissions are ready for API integration
- Component state management can be connected to state management libraries
- Mock data can be replaced with API calls
- Authentication can be added to routes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is ready for integration with your backend system.














