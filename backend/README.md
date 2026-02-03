# LearnLoop Backend

Backend API server for LearnLoop application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env` (or use the existing `.env` file)
- Update MongoDB URI, JWT secret, and Google OAuth credentials

3. Run the development server:
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/settings` - Update user settings (auth required)

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource (auth required)
- `GET /api/resources/:resourceId` - Get specific resource

### Comments
- `GET /api/comments?resourceId=xxx` - Get comments for a resource
- `POST /api/comments` - Create comment (auth required)

### Notifications
- `GET /api/notifications` - Get user notifications (auth required)

### Health
- `GET /api/health` - Health check endpoint

## Tech Stack

- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **Google OAuth** - Social login
- **TypeScript** - Type safety

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
