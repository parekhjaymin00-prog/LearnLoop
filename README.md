# ♾️ LearnLoop

![LearnLoop Banner](frontend/public/globe.svg)

**LearnLoop** is a modern, full-stack educational platform designed to streamline the learning process. It connects students with resources, tracks progress, and fosters a collaborative learning environment through a unified dashboard.

---

## 🚀 Features

-   **User Authentication**: Secure Login/Signup with Google OAuth and Email/Password (JWT).
-   **Dashboard**: Personalized user dashboard to track learning progress.
-   **Resource Management**: Organize study materials, links, and documents.
-   **Interactive Topics**: Deep dive into subjects with structured content.
-   **Community**: Comment systems and user profiles to interact with peers.
-   **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.
-   **Dark/Light Mode**: Built-in theme switching for comfortable reading.

---

## 🛠️ Tech Stack

### **Frontend**
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: Lucide React
-   **State Management**: React Context & Hooks

### **Backend**
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (with Mongoose ODM)
-   **Authentication**: JSON Web Tokens (JWT) & Google Auth Library
-   **Security**: Bcrypt, CORS, Helmet

---

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/parekhjaymin00-prog/LearnLoop.git
cd LearnLoop
```

### 2. Backend Setup
The backend handles the API and database connection.

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy valid credentials)
cp .env.example .env

# Run Development Server
npm run dev
```
*Backend runs on `http://localhost:5000` by default.*

### 3. Frontend Setup
The frontend is the user interface.

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Run Development Server
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🔑 Environment Variables

You need to configure these variables for the app to work.

**Backend (`backend/.env`)**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
client_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📂 Project Structure

```bash
LearnLoop/
├── frontend/          # Next.js Client Application
│   ├── src/app/       # Pages & Routes
│   ├── src/components/# UI Components
│   └── public/        # Static Assets
│
├── backend/           # Express Server Application
│   ├── src/models/    # Mongoose Schemas
│   ├── src/routes/    # API Endpoints
│   └── src/controllers/# request Handlers
│
└── README.md          # Project Documentation
```

## 🤝 Contributing

Contributions are welcome!
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---


