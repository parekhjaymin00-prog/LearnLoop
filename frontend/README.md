# LearnLoop

A domain-based learning and discussion platform built with Next.js, TypeScript, and MongoDB.

## Features

- 🎯 Domain-based organization (Technology, Finance, Design, Career, Academics, General Skills)
- 💬 Real-time discussions and messaging
- 📚 Resource sharing and collaboration
- 🔔 Notifications system
- 🌙 Dark/Light theme support
- 🔐 User authentication

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas with Mongoose
- **Animations:** Framer Motion

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
MOCK_MODE=false
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── context/          # React context providers
├── lib/              # Utility functions and data
└── models/           # MongoDB models
```

## Database

The project uses MongoDB Atlas for data persistence. Set `MOCK_MODE=true` in `.env.local` to use mock data for development without a database connection.
