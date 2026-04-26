import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
    try {
        const { credential, access_token } = await req.json();
        let email: string, name: string, picture: string, googleId: string;

        if (credential) {
            const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID });
            const payload = ticket.getPayload();
            if (!payload) throw new Error('Invalid token');
            email = payload.email!; name = payload.name!; picture = payload.picture!; googleId = payload.sub!;
        } else if (access_token) {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
            const info = await res.json();
            email = info.email; name = info.name; picture = info.picture; googleId = info.sub;
        } else {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const user = await prisma.user.upsert({
            where: { email },
            update: { googleId, avatar: picture },
            create: { email, name, avatar: picture, googleId, isGoogleAccount: true },
        });

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        const response = NextResponse.json({ message: 'Google login successful', user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
        response.cookies.set('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
        return response;
    } catch (error: any) {
        console.error('Google auth error:', error);
        return NextResponse.json({ error: 'Google authentication failed' }, { status: 401 });
    }
}
