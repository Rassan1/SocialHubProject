# The Social Hub - Frontend

React frontend for The Social Hub social networking platform.

## Prerequisites

- Node.js 16+ installed
- Backend API running on `http://localhost:8000`

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   └── auth/            # Authentication components
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── VerifyEmail.js
│   │       └── Auth.css
│   ├── context/
│   │   └── AuthContext.js   # Authentication context provider
│   ├── services/
│   │   └── api.js           # API service and axios config
│   ├── App.js               # Main app component with routing
│   ├── App.css
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── package.json
└── README.md
```

## Features Implemented

### Authentication System
- ✅ User Registration with university email validation
- ✅ Email Verification flow
- ✅ Login with JWT tokens
- ✅ Logout functionality
- ✅ Protected routes
- ✅ Automatic token refresh
- ✅ Auth context for global state

### Components
- ✅ Register Page - Complete signup form with validation
- ✅ Login Page - Email/password login with test accounts
- ✅ Email Verification Page - Token-based verification
- ✅ Home/Dashboard Page - User profile display

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

## API Integration

The frontend connects to the Django backend API at `http://localhost:8000/api`. Make sure the backend server is running before starting the frontend.

### API Services
- `authAPI` - Authentication endpoints
- `eventAPI` - Event management
- `chatAPI` - Real-time messaging
- `newsAPI` - News feed
- `userAPI` - User profiles

## Test Accounts

Use these accounts for testing:

**Admin:**
- Email: admin@university.ac.uk
- Password: admin123

**Student:**
- Email: student@university.ac.uk
- Password: TestPass123!

## Next Steps

### Upcoming Features
1. Event Discovery Page
2. Event Creation Form
3. Chat Interface
4. News Feed
5. User Profiles
6. Real-time WebSocket integration

## Styling

The app uses custom CSS with a purple gradient theme. All authentication pages are fully styled and responsive.

## Environment Variables

Create a `.env` file if needed:
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Notes

- The app uses React Router v6 for navigation
- JWT tokens are stored in localStorage
- Tokens automatically refresh when expired
- All routes except auth pages are protected
