import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        const resources = await prisma.resource.findMany({ where: { addedBy: user.email }, orderBy: { createdAt: 'desc' } });
        const totalMentions = await prisma.notification.count({ where: { userId: user.email, type: 'mention' } });
        const activeDomains = [...new Set(resources.map(r => r.domain))];
        const groupedResources: Record<string, Record<string, any[]>> = {};
        resources.forEach(r => {
            if (!groupedResources[r.domain]) groupedResources[r.domain] = {};
            if (!groupedResources[r.domain][r.topic]) groupedResources[r.domain][r.topic] = [];
            groupedResources[r.domain][r.topic].push(r);
        });
        return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt, isGoogleAccount: user.isGoogleAccount }, stats: { totalResources: resources.length, totalMentions, activeDomains }, resources: groupedResources });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
