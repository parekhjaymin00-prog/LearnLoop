import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
    try {
        const { credential, access_token } = await req.json();

        let email, name, picture, googleId;

        if (credential) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) throw new Error('Invalid Token payload');
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        } else if (access_token) {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            if (!userInfoRes.ok) throw new Error('Failed to fetch user info from Google');
            const userInfo = await userInfoRes.json();
            email = userInfo.email;
            name = userInfo.name;
            picture = userInfo.picture;
            googleId = userInfo.sub;
        } else {
            return NextResponse.json({ error: 'Missing Google Token' }, { status: 400 });
        }

        if (!email) return NextResponse.json({ error: 'Invalid Google Account' }, { status: 400 });

        // Forward to Express backend
        const res = await fetch('http://localhost:5000/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ googleId, email, name, avatar: picture }),
        });

        const data = await res.json();
        const response = NextResponse.json(data, { status: res.status });
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) response.headers.set('set-cookie', setCookie);
        return response;
    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.json({ error: 'Google authentication failed' }, { status: 401 });
    }
}
