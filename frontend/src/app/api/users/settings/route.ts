import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get('cookie') || '';
        const url = `http://localhost:5000${req.nextUrl.pathname}${req.nextUrl.search}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const cookie = req.headers.get('cookie') || '';
        const body = await req.json();
        const url = `http://localhost:5000${req.nextUrl.pathname}${req.nextUrl.search}`;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
    }
}
