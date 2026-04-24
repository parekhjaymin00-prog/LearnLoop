import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const cookie = req.headers.get('cookie') || '';
        const res = await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie },
        });
        const data = await res.json();
        const response = NextResponse.json(data, { status: res.status });
        response.cookies.delete('auth-token');
        return response;
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
    }
}
