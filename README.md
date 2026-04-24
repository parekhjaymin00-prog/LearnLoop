# LearnLoop

LearnLoop is a modern, full-stack application built with Next.js (Frontend) and Express + PostgreSQL (Backend).

## Prerequisites

- **Node.js**: v18 or later
- **PostgreSQL**: A running instance of PostgreSQL

## Setup Instructions

### 1. Install Dependencies
You need to install dependencies for both the frontend and backend.

```bash
# In the root, install backend dependencies
cd backend
npm install

# And frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
You'll need to configure `.env` files in both directories.

**Backend (`backend/.env`):**
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/learnloop_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
MOCK_MODE=false
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Database Setup (Prisma)
Ensure your PostgreSQL database is running, then apply migrations:

```bash
cd backend
npx prisma migrate dev
```

### 4. How to Run
Start both development servers.

**Start the Backend:**
```bash
cd backend
npm run dev
```
(Runs on `http://localhost:5000`)

**Start the Frontend:**
```bash
cd frontend
npm run dev
```
(Runs on `http://localhost:3000`)

## Contributing
Detailed contribution guidelines coming soon.
