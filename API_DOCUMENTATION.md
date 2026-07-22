# The Social Hub - API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register/`

Create a new user account with university email verification.

**Request Body:**
```json
{
  "email": "student@university.ac.uk",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "university": "University of Surrey",
  "accommodation_provider": "Scape",
  "interests": "sports, music, technology"
}
```

**Response:** `201 CREATED`
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "email": "student@university.ac.uk",
    "first_name": "John",
    "last_name": "Doe",
    ...
  },
  "verification_token": "abc123..."
}
```

### Verify Email
**POST** `/api/auth/verify-email/`

Verify user email with token sent during registration.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully",
  "user": {...},
  "tokens": {
    "refresh": "refresh_token",
    "access": "access_token"
  }
}
```

### Login
**POST** `/api/auth/login/`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "student@university.ac.uk",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {...},
  "tokens": {
    "refresh": "refresh_token",
    "access": "access_token"
  }
}
```

### Refresh Token
**POST** `/api/auth/token/refresh/`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refresh": "refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "access": "new_access_token"
}
```

### Logout
**POST** `/api/auth/logout/`

**Authentication Required**

Blacklist the refresh token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response:** `200 OK`

### Get Current User
**GET** `/api/auth/me/`

**Authentication Required**

Get authenticated user's profile.

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "student@university.ac.uk",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "",
  "profile_picture": null,
  "university": "University of Surrey",
  "accommodation_provider": "Scape",
  "interests": "sports, music, technology",
  "email_verified": true,
  "is_university_verified": true,
  "created_at": "2026-02-11T12:00:00Z"
}
```

### Update Profile
**PUT/PATCH** `/api/auth/profile/`

**Authentication Required**

Update user profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "bio": "Computer Science student",
  "interests": "coding, gaming"
}
```

### Request Password Reset
**POST** `/api/auth/password-reset/`

Request a password reset token via email.

**Request Body:**
```json
{
  "email": "student@university.ac.uk"
}
```

**Response:** `200 OK`
```json
{
  "message": "If the email exists, a password reset link has been sent",
  "reset_token": "token_here"
}
```

**Note:** In development, the token is returned in the response. In production, it should only be sent via email.

### Confirm Password Reset
**POST** `/api/auth/password-reset-confirm/`

Reset password using the token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!",
  "password2": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

**Error Response:** `400 BAD REQUEST`
```json
{
  "error": "Password reset token has expired"
}
```

**Note:** Tokens expire after 24 hours.

---

## User Endpoints

### List Users
**GET** `/api/users/`

**Authentication Required**

Search and filter users.

**Query Parameters:**
- `search` - Search by name or email
- `provider` - Filter by accommodation provider
- `university` - Filter by university

**Example:** `/api/users/?search=john&provider=Scape`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "email": "student@university.ac.uk",
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
]
```

### Get User Details
**GET** `/api/users/<id>/`

**Authentication Required**

Get specific user's profile.

---

## Event Endpoints

### List Events
**GET** `/api/events/`

**Authentication Required**

Get list of events with filters.

**Query Parameters:**
- `category` - Filter by category (SOCIAL, SPORTS, STUDY, FOOD, etc.)
- `search` - Search in title, description, or tags
- `start_date` - Filter events starting from date
- `end_date` - Filter events until date
- `upcoming=true` - Show only upcoming events
- `attending=true` - Show events user is attending
- `my_events=true` - Show events user created

**Example:** `/api/events/?category=SOCIAL&upcoming=true`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Football Match",
    "category": "SPORTS",
    "location": "Scape Sports Field",
    "start_time": "2026-02-15T18:00:00Z",
    "end_time": "2026-02-15T20:00:00Z",
    "creator": {...},
    "attendee_count": 12,
    "is_attending": false,
    "image": null,
    "created_at": "2026-02-11T12:00:00Z"
  }
]
```

### Create Event
**POST** `/api/events/`

**Authentication Required**

Create a new event.

**Request Body:**
```json
{
  "title": "Movie Night",
  "description": "Watch latest blockbuster together",
  "category": "ENTERTAINMENT",
  "location": "Scape Common Room",
  "start_time": "2026-02-20T19:00:00Z",
  "end_time": "2026-02-20T22:00:00Z",
  "max_attendees": 20,
  "tags": "movies, entertainment, social"
}
```

**Response:** `201 CREATED`

### Get Event Details
**GET** `/api/events/<id>/`

**Authentication Required**

Get full event details including comments.

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Football Match",
  "description": "Friendly football match",
  "category": "SPORTS",
  "location": "Scape Sports Field",
  "start_time": "2026-02-15T18:00:00Z",
  "end_time": "2026-02-15T20:00:00Z",
  "max_attendees": 20,
  "creator": {...},
  "attendee_count": 12,
  "is_attending": false,
  "available_spots": 8,
  "tags": "football, sports",
  "is_active": true,
  "is_cancelled": false,
  "comments": [...]
}
```

### Update Event
**PUT/PATCH** `/api/events/<id>/`

**Authentication Required** (Creator only)

Update event details.

### Delete Event
**DELETE** `/api/events/<id>/`

**Authentication Required** (Creator only)

Delete an event.

### Join Event
**POST** `/api/events/<id>/join/`

**Authentication Required**

Join an event as an attendee.

**Response:** `200 OK`
```json
{
  "message": "Successfully joined event",
  "event": {...}
}
```

### Leave Event
**POST** `/api/events/<id>/leave/`

**Authentication Required**

Leave an event.

### List Event Comments
**GET** `/api/events/<id>/comments/`

**Authentication Required**

Get all comments for an event.

### Create Event Comment
**POST** `/api/events/<id>/comments/`

**Authentication Required**

Add a comment to an event.

**Request Body:**
```json
{
  "content": "Looking forward to this!"
}
```

---

## Chat Endpoints

### List Chat Rooms
**GET** `/api/chat/rooms/`

**Authentication Required**

Get all chat rooms where user is a participant.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "",
    "room_type": "DIRECT",
    "participant_count": 2,
    "last_message": {
      "id": 5,
      "sender": {...},
      "content": "Hey, how are you?",
      "created_at": "2026-02-11T14:00:00Z"
    },
    "unread_count": 3,
    "updated_at": "2026-02-11T14:00:00Z"
  }
]
```

### Create Chat Room
**POST** `/api/chat/rooms/`

**Authentication Required**

Create a group chat room.

**Request Body:**
```json
{
  "name": "Study Group",
  "room_type": "GROUP",
  "participant_ids": [2, 3, 4]
}
```

### Get Chat Room Details
**GET** `/api/chat/rooms/<id>/`

**Authentication Required**

Get chat room details.

### Create Direct Chat
**POST** `/api/chat/direct/`

**Authentication Required**

Create or get existing direct chat with another user.

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response:** `200 OK` or `201 CREATED`
```json
{
  "message": "Chat room created",
  "chat_room": {...}
}
```

### List Messages
**GET** `/api/chat/rooms/<room_id>/messages/`

**Authentication Required**

Get all messages in a chat room.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "room": 1,
    "sender": {...},
    "content": "Hello!",
    "image": null,
    "is_read": true,
    "created_at": "2026-02-11T12:00:00Z"
  }
]
```

### Send Message
**POST** `/api/chat/rooms/<room_id>/messages/`

**Authentication Required**

Send a message in a chat room.

**Request Body:**
```json
{
  "room": 1,
  "content": "Hi there!"
}
```

### Mark Messages as Read
**POST** `/api/chat/rooms/<room_id>/mark-read/`

**Authentication Required**

Mark all messages in a room as read.

---

## News Endpoints

### List News Posts
**GET** `/api/news/`

**Authentication Required**

Get news posts filtered by user's accommodation provider.

**Query Parameters:**
- `provider` - Filter by specific provider
- `category` - Filter by category (ANNOUNCEMENT, MAINTENANCE, EVENT, UPDATE, ALERT)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Maintenance Notice",
    "category": "MAINTENANCE",
    "author": {...},
    "accommodation_provider": "Scape",
    "is_pinned": true,
    "published_at": "2026-02-11T10:00:00Z",
    "created_at": "2026-02-11T09:00:00Z"
  }
]
```

### Create News Post
**POST** `/api/news/`

**Authentication Required** (Staff only)

Create a new news post.

**Request Body:**
```json
{
  "title": "Weekend Event",
  "content": "Join us for a community event this weekend!",
  "category": "EVENT",
  "accommodation_provider": "Scape",
  "is_pinned": false,
  "is_published": true
}
```

### Get News Post Details
**GET** `/api/news/<id>/`

**Authentication Required**

Get full news post details.

### Update News Post
**PUT/PATCH** `/api/news/<id>/`

**Authentication Required** (Staff only)

Update a news post.

### Delete News Post
**DELETE** `/api/news/<id>/`

**Authentication Required** (Staff only)

Delete a news post.

---

## Recommendation Endpoints

### Get Personalized Event Recommendations
**GET** `/api/recommendations/events/`

**Authentication Required**

Get AI-powered personalized event recommendations based on user interests, past attendance, and similar users' preferences.

**Query Parameters:**
- `limit` - Number of recommendations to return (default: 10, max: 50)

**Example:** `/api/recommendations/events/?limit=20`

**Response:** `200 OK`
```json
{
  "count": 10,
  "results": [
    {
      "id": 5,
      "title": "Football Match",
      "description": "Friendly football game at Scape",
      "category": "SPORTS",
      "location": "Scape Sports Field",
      "start_time": "2026-02-20T18:00:00Z",
      "end_time": "2026-02-20T20:00:00Z",
      "max_attendees": 20,
      "creator": {...},
      "attendee_count": 8,
      "is_attending": false,
      "available_spots": 12,
      "tags": "football, sports"
    },
    ...
  ]
}
```

**Algorithm Details:**
The recommendation engine uses multiple factors:
- **User Interests**: Matches event categories/tags with user's interest profile
- **Past Behavior**: Analyzes previous event attendance patterns
- **Collaborative Filtering**: Finds similar users and recommends their attended events
- **Category Affinity**: Learns user's preferred event categories over time
- **Recency**: Prioritizes upcoming events

### Get Similar Events
**GET** `/api/recommendations/events/<event_id>/similar/`

**Authentication Required**

Get events similar to a specific event based on category, tags, location, and other attributes.

**Query Parameters:**
- `limit` - Number of similar events to return (default: 5, max: 20)

**Example:** `/api/recommendations/events/3/similar/?limit=10`

**Response:** `200 OK`
```json
{
  "event_id": 3,
  "count": 5,
  "results": [
    {
      "id": 7,
      "title": "Basketball Tournament",
      "category": "SPORTS",
      "location": "Unite Students Gym",
      "start_time": "2026-02-22T16:00:00Z",
      ...
    },
    ...
  ]
}
```

**Similarity Calculation:**
Events are compared based on:
- Same or similar category
- Matching tags
- Similar location/provider
- Similar time of day
- Creator's other events

**Error Response:** `404 NOT FOUND`
```json
{
  "error": "Event not found"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "field_errors": {
    "email": ["This field is required"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.ac.uk",
    "password": "TestPassword123!",
    "password2": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User",
    "university": "Test University",
    "accommodation_provider": "Scape"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.ac.uk",
    "password": "TestPassword123!"
  }'
```

### Get Events (with authentication)
```bash
curl -X GET http://localhost:8000/api/events/ \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Pagination

List endpoints return paginated results:

```json
{
  "count": 50,
  "next": "http://localhost:8000/api/events/?page=2",
  "previous": null,
  "results": [...]
}
```

**Pagination Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default varies by endpoint)

**Example:** `/api/events/?page=2&page_size=20`

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider implementing:
- Django REST Framework's built-in throttling
- Per-user rate limits
- Anonymous user restrictions
- API key management for external integrations

---

## Development vs Production

### Development Mode
- Email tokens returned in API responses
- CORS allows localhost origins
- Debug mode enabled
- Console email backend
- Verbose error messages

### Production Recommendations
1. **Security:**
   - Set `DEBUG=False`
   - Use strong `SECRET_KEY`
   - Configure proper `ALLOWED_HOSTS`
   - Enable HTTPS only
   - Hide sensitive error details

2. **Email:**
   - Configure SMTP backend
   - Send verification/reset tokens via email only
   - Use email templates

3. **Database:**
   - Use managed PostgreSQL service
   - Enable automated backups
   - Connection pooling

4. **Performance:**
   - Enable caching (Redis)
   - Use CDN for static files
   - Implement database indexing
   - Add rate limiting

5. **Monitoring:**
   - Error tracking (Sentry)
   - Performance monitoring
   - Log aggregation
   - Uptime monitoring

