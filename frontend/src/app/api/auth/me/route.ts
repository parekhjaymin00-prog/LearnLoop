import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get('cookie') || '';
        const res = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
    }
}
