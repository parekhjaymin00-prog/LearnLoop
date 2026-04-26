import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        const response = NextResponse.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
        response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
