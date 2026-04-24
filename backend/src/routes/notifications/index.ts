import { Router } from 'express';
import prisma from '../../lib/db';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const notifications = await prisma.notification.findMany({ where: { userId: currentUser.email }, orderBy: { createdAt: 'desc' }, take: 20 });
        const unreadCount = await prisma.notification.count({ where: { userId: currentUser.email, read: false } });
        return res.json({ notifications, unreadCount });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.patch('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { notificationIds } = req.body;
        if (!notificationIds || !Array.isArray(notificationIds)) return res.status(400).json({ error: 'notificationIds array is required' });
        await prisma.notification.updateMany({ where: { id: { in: notificationIds }, userId: currentUser.email }, data: { read: true } });
        return res.json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to update notifications' });
    }
});

export default router;
