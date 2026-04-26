import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ serverStatus: 'UP', databaseStatus: 'CONNECTED', serverTime: new Date().toISOString() });
    } catch (error: any) {
        return NextResponse.json({ serverStatus: 'UP', databaseStatus: 'ERROR', error: error.message }, { status: 503 });
    }
}
