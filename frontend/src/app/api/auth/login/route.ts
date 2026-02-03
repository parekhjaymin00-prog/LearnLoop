import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth-utils';
import { validateLogin } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, formatResetTime } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        // Rate limiting - use email + IP for more granular control
        const clientId = getClientIdentifier(req);
        const body = await req.json();
        const rateLimitKey = `${clientId}:${body.email || 'unknown'}`;

        console.log('🔐 [AUTH/LOGIN] Login attempt:', {
            email: body.email,
            clientId,
            timestamp: new Date().toISOString(),
        });

        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.LOGIN);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: `Too many login attempts. Please try again in ${formatResetTime(rateLimit.resetTime)}.`
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': RATE_LIMITS.LOGIN.maxAttempts.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
                    }
                }
            );
        }

        const { email, password } = body;

        // Validate input
        const validation = validateLogin({ email, password });
        if (!validation.success) {
            const errors = validation.error.errors.map(err => err.message).join(', ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        // Check if we're in mock mode
        if (process.env.MOCK_MODE === 'true') {
            // Mock mode - simplified for development
            const mockUser = {
                _id: Date.now().toString(),
                name: validation.data.email.split('@')[0],
                email: validation.data.email,
                avatar: validation.data.email.charAt(0).toUpperCase(),
            };

            const token = generateToken(mockUser._id, mockUser.email);
            await setAuthCookie(token);

            return NextResponse.json({
                message: 'Login successful (Mock Mode)',
                user: {
                    id: mockUser._id,
                    name: mockUser.name,
                    email: mockUser.email,
                    avatar: mockUser.avatar,
                }
            });
        }

        // Real MongoDB mode
        await connectDB();

        // Find user by email
        const user = await User.findOne({ email: validation.data.email });
        if (!user) {
            console.log('❌ [AUTH/LOGIN] Login failed: User not found', { email: validation.data.email });
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Compare passwords using bcrypt
        const isPasswordValid = await comparePassword(validation.data.password, user.password);
        if (!isPasswordValid) {
            console.log('❌ [AUTH/LOGIN] Login failed: Invalid password', { email: validation.data.email });
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken(user._id.toString(), user.email);

        // Set HTTP-only cookie
        await setAuthCookie(token);

        console.log('✅ [AUTH/LOGIN] Login successful', { email: user.email, userId: user._id.toString() });

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        }, {
            headers: {
                'X-RateLimit-Limit': RATE_LIMITS.LOGIN.maxAttempts.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            }
        });

    } catch (error: any) {
        console.error('❌ [AUTH/LOGIN] Login error:', error.message);
        console.error('❌ [AUTH/LOGIN] Stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
