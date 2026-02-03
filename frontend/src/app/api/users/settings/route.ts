import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth-utils';

// GET - Get current user settings
export async function GET(req: NextRequest) {
    try {
        // Get token from cookies
        const token = req.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = verifyToken(token);
        if (!userData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: userData.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            settings: {
                notificationsEnabled: user.notificationsEnabled ?? true,
                mentionsEnabled: user.mentionsEnabled ?? true,
            }
        });

    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PATCH - Update user settings
export async function PATCH(req: NextRequest) {
    try {
        // Get token from cookies
        const token = req.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = verifyToken(token);
        if (!userData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { notificationsEnabled, mentionsEnabled } = body;

        await connectDB();

        const user = await User.findOne({ email: userData.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update settings
        if (typeof notificationsEnabled === 'boolean') {
            user.notificationsEnabled = notificationsEnabled;
        }
        if (typeof mentionsEnabled === 'boolean') {
            user.mentionsEnabled = mentionsEnabled;
        }

        await user.save();

        return NextResponse.json({
            message: 'Settings updated successfully',
            settings: {
                notificationsEnabled: user.notificationsEnabled,
                mentionsEnabled: user.mentionsEnabled,
            }
        });

    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
