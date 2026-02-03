import { Router } from 'express';
import connectDB from '../../lib/db';
import Notification from '../../models/Notification';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

// GET /api/notifications - Get notifications for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        await connectDB();

        const notifications = await Notification.find({ userId: currentUser.email })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ notifications });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

export default router;
