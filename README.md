# SocialHubProject
A Full-Stack, event driven web based platform 

## Project Overview

The Social Hub enables students from different accommodation providers to connect through event-based interactions while maintaining privacy and verification through university email domains.

## Features

- Event creation and discovery
- AI-based event recommendations
- Real-time chat functionality
- Email verification via university domains
- Staff-managed accommodation news feed
- Privacy-focused design with minimal data retention

## Technology Stack

### Backend
- Django REST Framework
- PostgreSQL (Docker)
- JWT Authentication
- Python

### Frontend
- React JS
- Modern UI components
- Responsive design

### Infrastructure
- **Docker Compose** orchestrates all services (backend, frontend, PostgreSQL database, and Redis cache)
- Containers ensure consistent development and deployment environments

## Project Structure

```
the-social-hub/
├── backend/              # Django REST API
├── frontend/             # React application
├── API_DOCUMENTATION.md  # REST API documentation
├── docker-compose.yml    # Defines all services (backend, frontend, PostgreSQL, Redis)
└── README.md
```

## Getting Started

### Prerequisites
> All components of the application run in Docker containers. Docker & Docker Compose are required to build and start every service.

- Docker & Docker Compose (required for backend, frontend, database, cache)
- Python 3.10+ (only if you plan to run backend locally outside of Docker)
- Node.js 18+ (only if you plan to run frontend locally outside of Docker)
- Git

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/the-social-hub.git
cd the-social-hub
```

#### 2. Start Docker Services
Ensure Docker Desktop is running, then start **all** services defined in `docker-compose.yml` (backend, frontend, PostgreSQL, and Redis):
```bash
docker-compose up -d --build
```

> 🚀 All development and testing happens inside containers. You do **not** need to run the backend or frontend manually – simply access the running services as described below.

#### 3. Accessing Services
Once Docker Compose has finished building and starting containers, you can hit the application endpoints directly:

- **Frontend:** `http://localhost`
- **Backend API:** `http://localhost:8000/api`
- **Admin Panel:** `http://localhost:8000/admin`

> The backend container automatically runs migrations and seeds test data on first startup.

(If you need to rebuild or reseed, see the Docker section further down.)

### Running with Docker (Full Stack)

The recommended way to launch the application is via Docker Compose, which builds and starts every component as a container:

```bash
docker-compose up --build
```

This command brings up:
- **postgres** database
- **redis** cache
- **backend** Django API (migrations and seed data are executed automatically)
- **frontend** React app

Access the application via the URLs below once the compose process completes.

**Note:** Docker automatically runs migrations and seeds the database with test data on first startup.

Access the application:
- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`

**Test Accounts (Auto-created):**
- Admin: admin@university.ac.uk / admin123
- Student: student@university.ac.uk / TestPass123!

To reseed data (if needed):
```bash
docker-compose exec backend python manage.py seed_data
```

### Testing

Tests are executed inside the Docker containers so that they run against the same environment used by the application.

#### Backend Tests
```bash
docker-compose exec backend python manage.py test
```

#### Frontend Tests
```bash
docker-compose exec frontend npm test
```

### Development Workflow

1. **Create a new feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in backend and/or frontend (changes are reflected in containers via mounted volumes)

3. **Test your changes** using the containerized commands:
   - Backend: `docker-compose exec backend python manage.py test`
   - Frontend: `docker-compose exec frontend npm test`

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** for review

### Environment Variables

#### Backend (.env)
- `DEBUG` - Enable debug mode (True/False)
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `USE_POSTGRESQL` - Use PostgreSQL instead of SQLite (True/False)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` - Database credentials
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `ALLOWED_EMAIL_DOMAINS` - Comma-separated list of allowed university email domains

#### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL

### Key Features Implementation

#### User Authentication
- University email verification (`.ac.uk` or `.edu` domains)
- JWT token-based authentication
- Email verification with tokens
- Password reset functionality

#### Events System
- Create, update, and delete events
- Join/leave events with capacity management
- Event categories and filtering
- AI-powered event recommendations
- Event comments and discussions

#### Chat System
- Direct messaging between users
- Group chat rooms
- Event-specific chat rooms
- Real-time message updates (polling)
- Unread message tracking

#### News Feed
- Staff-managed news posts
- Category filtering (Announcement, Maintenance, Event, Update, Alert)
- Accommodation provider-specific news
- Pinned posts feature

#### AI Recommendations
- Personalized event recommendations based on:
  - User interests
  - Past event attendance
  - Similar users' preferences
  - Category affinity
- Similar events suggestions

### API Documentation

Comprehensive API documentation is available in `API_DOCUMENTATION.md`

Key endpoints:
- **Authentication:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Events:** `/api/events/*`
- **Chat:** `/api/chat/*`
- **News:** `/api/news/*`
- **Recommendations:** `/api/recommendations/*`

### Project Architecture

#### Backend Structure
```
backend/
├── config/              # Django settings and main URLs
├── users/              # User authentication and profiles
├── events/             # Event management
├── chat/               # Real-time chat system
├── news/               # News feed system
├── recommendations/    # AI recommendation engine
├── manage.py
└── requirements.txt
```

#### Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/     # Reusable components
│   │   ├── auth/       # Login, register, etc.
│   │   ├── layout/     # Header, sidebar, etc.
│   │   └── common/     # Shared UI components
│   ├── pages/          # Page components
│   │   ├── chat/       # Chat interface
│   │   ├── events/     # Event pages
│   │   ├── news/       # News feed
│   │   └── profile/    # User profile
│   ├── context/        # React context (auth, etc.)
│   ├── services/       # API service layer
│   ├── App.js
│   └── index.js
├── package.json
└── .env
```

### Database Schema

The project uses PostgreSQL with the following main models:
- **User** - Extended Django user with university verification
- **Event** - Events with categories, capacity, and attendance
- **ChatRoom** - Direct and group chat rooms
- **Message** - Chat messages with read status
- **NewsPost** - Staff-managed news posts
- **EventComment** - Comments on events

### Troubleshooting

#### Docker Issues
**Issue:** `unable to get image` or `cannot find the file specified`
**Solution:** Ensure Docker Desktop is running before executing docker-compose commands

**Issue:** Port already in use
**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :8000
# Kill the process or change the port in docker-compose.yml
```

#### Backend Issues
**Issue:** Database connection errors
**Solution:** Ensure PostgreSQL container is running: `docker ps`

**Issue:** Migration errors
**Solution:** Reset migrations:
```bash
python manage.py migrate --run-syncdb
```

#### Frontend Issues
**Issue:** API connection errors
**Solution:** Verify `REACT_APP_API_URL` in `.env` matches backend URL

**Issue:** CORS errors
**Solution:** Ensure frontend URL is in backend's `CORS_ALLOWED_ORIGINS`

### Security Notes

**Important for Production:**
1. Change `SECRET_KEY` to a strong random value
2. Set `DEBUG=False`
3. Configure proper `ALLOWED_HOSTS`
4. Use environment-specific `.env` files
5. Enable HTTPS
6. Configure real email backend (not console)
7. Set up proper database backups
8. Implement rate limiting
9. Enable CSRF protection
10. Review and update CORS settings

### Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please ensure:
- Code follows project style guidelines
- Tests pass successfully
- Documentation is updated
- Commit messages are descriptive

### License

This project is licensed under the MIT License - see the LICENSE file for details.

### Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: [your-email@example.com]

### Acknowledgments

- Django REST Framework for robust API development
- React for modern frontend architecture
- PostgreSQL for reliable data storage
- Docker for containerization
