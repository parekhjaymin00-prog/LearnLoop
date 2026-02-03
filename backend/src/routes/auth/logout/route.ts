import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth-utils';

export async function POST() {
    try {
        // Clear the authentication cookie
        await clearAuthCookie();

        return NextResponse.json({
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
