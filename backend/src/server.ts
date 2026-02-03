import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import connectDB from './lib/db';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import resourceRoutes from './routes/resources';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';
import healthRoutes from './routes/health';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression()); // Compress all responses
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`📨 [${req.method}] ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'LearnLoop Backend API',
        version: '1.0.0',
        status: 'running'
    });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ [ERROR]', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 [SERVER] Backend running on port ${PORT}`);
            console.log(`🌍 [SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 [SERVER] Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    } catch (error) {
        console.error('❌ [SERVER] Failed to start:', error);
        process.exit(1);
    }
};

startServer();

export default app;
