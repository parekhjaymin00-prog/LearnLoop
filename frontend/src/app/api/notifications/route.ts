import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        const notifications = await prisma.notification.findMany({ where: { userId: decoded.email }, orderBy: { createdAt: 'desc' }, take: 20 });
        const unreadCount = await prisma.notification.count({ where: { userId: decoded.email, read: false } });
        return NextResponse.json({ notifications, unreadCount });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        const { notificationIds } = await req.json();
        if (!notificationIds || !Array.isArray(notificationIds)) return NextResponse.json({ error: 'notificationIds required' }, { status: 400 });
        await prisma.notification.updateMany({ where: { id: { in: notificationIds }, userId: decoded.email }, data: { read: true } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
