import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, isGoogleAccount: user.isGoogleAccount, notificationsEnabled: user.notificationsEnabled, mentionsEnabled: user.mentionsEnabled } });
    } catch (error: any) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
