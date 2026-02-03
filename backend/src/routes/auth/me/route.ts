import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
    try {
        // Get current user from JWT token
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check if we're in mock mode
        if (process.env.MOCK_MODE === 'true') {
            return NextResponse.json({
                user: {
                    id: currentUser.userId,
                    email: currentUser.email,
                    name: currentUser.email.split('@')[0],
                    avatar: currentUser.email.charAt(0).toUpperCase(),
                }
            });
        }

        // Real MongoDB mode - fetch full user data
        await connectDB();

        const user = await User.findById(currentUser.userId).select('-password');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });

    } catch (error: any) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
