import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = searchParams.get('domain');
        const topic = searchParams.get('topic');
        const where: any = {};
        if (domain) where.domain = domain;
        if (topic) where.topic = topic;
        const resources = await prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ resources });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };

        const { title, type, url, size, domain, topic } = await req.json();
        if (!title || !type || !domain || !topic) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        const resource = await prisma.resource.create({
            data: { title, type, url, size, domain, topic, addedBy: decoded.email },
        });
        return NextResponse.json({ message: 'Resource created', resource }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
    }
}
