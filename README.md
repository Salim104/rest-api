# REST API with Authentication and Event Management

A simple REST API built with Node.js, Express, and SQLite for user authentication and event management.

## Features

- User authentication (signup and login)
- JWT-based authorization
- Password hashing with bcryptjs
- Event CRUD operations
- SQLite database for persistent storage

## Project Structure

```
├── app.js               # Main application file
├── db/                  # Database related files
│   ├── data/            # SQLite database files
│   ├── dbService.js     # Database connection service
│   └── initDb.js        # Database initialization
├── models/              # Data models
│   ├── userModel.js     # User model
│   └── eventModel.js    # Event model
├── controllers/         # Route controllers
│   ├── userController.js # User controller
│   └── eventController.js # Event controller
├── routes/              # Route definitions
│   ├── userRoutes.js    # User routes
│   └── events.js        # Event routes
├── util/                # Utility functions
│   └── auth.js          # Authentication utilities
```

## API Endpoints

### Authentication
- `POST /users/signup` - Register a new user
- `POST /users/login` - Login existing user

### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get single event by ID
- `POST /events` - Create a new event
- `PUT /events/:id` - Update an event
- `DELETE /events/:id` - Delete an event

## Setup and Installation

1. Clone the repository
```bash
git clone https://github.com/Salim104/rest-api.git
cd rest-api
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm run dev
```

The server will start on http://localhost:3000

## Technologies Used

- Node.js
- Express.js
- SQLite (better-sqlite3)
- bcryptjs
- JSON Web Tokens (jsonwebtoken)

## Future Improvements

- Add middleware for protected routes
- Add input validation middleware
- Implement refresh tokens
- Add user roles and permissions 