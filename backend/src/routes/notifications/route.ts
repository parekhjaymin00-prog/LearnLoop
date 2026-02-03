import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { mockStore } from '@/lib/mock-store';

// GET - Fetch notifications for a user
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        console.log('🔔 [NOTIFICATIONS/GET] Fetching notifications:', { userId });

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Mock mode
        if (process.env.MOCK_MODE === 'true') {
            const notifications = mockStore.getNotifications(userId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 20);
            const unreadCount = notifications.filter(n => !n.read).length;
            return NextResponse.json({ notifications, unreadCount }, { status: 200 });
        }

        // Database mode
        await connectDB();
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20); // Limit to 20 most recent notifications

        const unreadCount = await Notification.countDocuments({ userId, read: false });

        console.log('✅ [NOTIFICATIONS/GET] Retrieved notifications:', { count: notifications.length, unreadCount, userId });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });
    } catch (error: any) {
        console.error('❌ [NOTIFICATIONS/GET] Error fetching notifications:', error.message);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH - Mark notifications as read
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { notificationIds, userId } = body;

        console.log('🔔 [NOTIFICATIONS/PATCH] Marking as read:', { count: notificationIds?.length, userId });

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json({ error: 'notificationIds array is required' }, { status: 400 });
        }

        // Mock mode
        if (process.env.MOCK_MODE === 'true') {
            mockStore.markNotificationsAsRead(notificationIds, userId);
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Database mode
        await connectDB();
        // Mark specified notifications as read
        await Notification.updateMany(
            { _id: { $in: notificationIds }, userId },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('❌ [NOTIFICATIONS/PATCH] Error updating notifications:', error.message);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
