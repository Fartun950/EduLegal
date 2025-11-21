# UI Architecture & Backend Integration Guide

## How the UI Works

**Architecture:**
- Single-page application built with React and React Router
- Component-based structure with reusable UI components (Button, Card, Table, Modal, etc.)
- Role-based routing with three main user roles: Admin, Legal Officer, and Student
- Each role has different views and permissions based on URL paths

**Current State:**
- **No backend connection** - All data is mock/static data hardcoded in components
- Forms currently log to console instead of submitting to an API
- File uploads are handled client-side only with no actual storage
- No authentication system - user role is determined by the current URL pathname
- No persistent state - all data resets when the page refreshes
- Statistics, case lists, and user data are all static arrays defined in components

**Data Flow:**
- Student submits complaint → Form validation → Console log (needs API POST)
- Admin views dashboard → Sees mock case data → Assigns officer (needs API call)
- Legal Officer views cases → Opens case details → Adds notes (needs API updates)
- All interactions are currently simulated with local state changes

**Key Components:**
- Admin Dashboard displays mock statistics, charts, and a cases table
- Student Complaint Form validates input but doesn't send data anywhere
- Case Details pages show static case information
- Modals and forms update local state only

---

## How to Integrate Backend

**Overview:**
Replace all mock data with API calls, add authentication, and connect forms to backend endpoints.

**Integration Steps:**

1. **Install HTTP Client** - Add axios or use native fetch for making API requests

2. **Create API Service Layer** - Set up a central service file to handle all API calls with base URL configuration, authentication headers, and error handling

3. **Replace Mock Data** - Find all hardcoded arrays (like `cases`, `stats`, `officers`) in dashboard components and replace with API calls in useEffect hooks to fetch real data on component mount

4. **Connect Form Submissions** - Update form handlers (like in StudentComplaintForm) to send POST requests with form data to backend endpoints instead of logging to console

5. **Add Authentication** - Implement login system with JWT tokens stored in localStorage, add protected routes that check for authentication, and update role detection to use actual user data from API instead of URL pathname

6. **Handle File Uploads** - Configure file uploads to send multipart/form-data requests to backend endpoints for document storage

7. **Add Real-Time Updates** - After mutations (like assigning officer, updating status), refresh data from API to show latest changes

8. **Error Handling** - Add try/catch blocks around API calls, handle 401 errors by redirecting to login, and display user-friendly error messages

**Expected Backend Endpoints:**
- Cases: GET list, GET by ID, POST create, PUT update, POST assign officer
- Dashboard: GET statistics
- Authentication: POST login, GET current user
- Documents: POST upload, GET download
- Forum: GET posts, POST create, PUT update, DELETE

**Integration Points to Update:**
- AdminDashboard: Replace stats and cases arrays with API calls
- StudentComplaintForm: Send form submission to API endpoint
- CaseDetails: Fetch case data by ID from API
- All components that display lists of data need API integration
- All forms need POST/PUT requests to backend
- Role-based access should check authentication tokens, not URL paths
