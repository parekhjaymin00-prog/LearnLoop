import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth-utils';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, formatResetTime } from '@/lib/rate-limit';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(req);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.LOGIN);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: `Too many login attempts. Please try again in ${formatResetTime(rateLimit.resetTime)}.` },
                { status: 429 }
            );
        }

        const { credential, access_token } = await req.json();

        let email, name, picture, googleId;

        if (credential) {
            // Verify ID Token (Standard Google Button)
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
            // Verify/Fetch via Access Token (Custom Button)
            const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
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

        if (!email) {
            return NextResponse.json({ error: 'Invalid Google Account' }, { status: 400 });
        }

        await connectDB();

        // Find or Create User
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: randomPassword,
                avatar: picture,
                googleId: googleId,
                isGoogleAccount: true
            });
        } else {
            // Update existing user with Google info if missing
            if (!user.googleId) {
                user.googleId = googleId;
                user.isGoogleAccount = true;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        }

        // Generate Session Token
        const token = generateToken(user._id.toString(), user.email);
        await setAuthCookie(token);

        return NextResponse.json({
            message: 'Google Login successful',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });

    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.json(
            { error: 'Google authentication failed' },
            { status: 401 }
        );
    }
}
