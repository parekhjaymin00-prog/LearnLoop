import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
    try {
        const { resourceId } = await params;
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        return NextResponse.json({ resource });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
    }
}
