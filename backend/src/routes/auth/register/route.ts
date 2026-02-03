import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth-utils';
import { validateRegistration } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, formatResetTime } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(req);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.REGISTER);

        console.log('📝 [AUTH/REGISTER] Registration attempt:', {
            clientId,
            timestamp: new Date().toISOString(),
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: `Too many registration attempts. Please try again in ${formatResetTime(rateLimit.resetTime)}.`
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': RATE_LIMITS.REGISTER.maxAttempts.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
                    }
                }
            );
        }

        const { name, email, password } = await req.json();

        // Validate input
        const validation = validateRegistration({ name, email, password });
        if (!validation.success) {
            const errors = validation.error.errors.map(err => err.message).join(', ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        // Check if we're in mock mode
        if (process.env.MOCK_MODE === 'true') {
            // Mock mode - simplified for development
            const mockUser = {
                _id: Date.now().toString(),
                name: validation.data.name,
                email: validation.data.email,
                avatar: validation.data.name.charAt(0).toUpperCase(),
            };

            const token = generateToken(mockUser._id, mockUser.email);
            await setAuthCookie(token);

            return NextResponse.json({
                message: 'User created successfully (Mock Mode)',
                user: {
                    id: mockUser._id,
                    name: mockUser.name,
                    email: mockUser.email,
                    avatar: mockUser.avatar,
                }
            }, { status: 201 });
        }

        // Real MongoDB mode
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validation.data.email });
        if (existingUser) {
            console.log('❌ [AUTH/REGISTER] Registration failed: User already exists', { email: validation.data.email });
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(validation.data.password);

        // Create user
        const newUser = await User.create({
            name: validation.data.name,
            email: validation.data.email,
            password: hashedPassword,
            avatar: validation.data.name.charAt(0).toUpperCase(),
        });

        // Generate JWT token
        const token = generateToken(newUser._id.toString(), newUser.email);

        // Set HTTP-only cookie
        await setAuthCookie(token);

        console.log('✅ [AUTH/REGISTER] Registration successful', { email: newUser.email, userId: newUser._id.toString() });

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
            }
        }, {
            status: 201,
            headers: {
                'X-RateLimit-Limit': RATE_LIMITS.REGISTER.maxAttempts.toString(),
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            }
        });

    } catch (error: any) {
        console.error('❌ [AUTH/REGISTER] Registration error:', error.message);
        console.error('❌ [AUTH/REGISTER] Stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
