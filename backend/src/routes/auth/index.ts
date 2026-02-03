import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '../../lib/db';
import User from '../../models/User';
import { generateToken, setAuthCookie, clearAuthCookie, getCurrentUser, hashPassword, comparePassword } from '../../lib/auth-utils';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, formatResetTime } from '../../lib/rate-limit';

const router = Router();
const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// Google OAuth Login
router.post('/google', async (req, res) => {
    try {
        const clientId = getClientIdentifier(req);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.LOGIN);

        if (!rateLimit.allowed) {
            return res.status(429).json({
                error: `Too many login attempts. Please try again in ${formatResetTime(rateLimit.resetTime)}.`
            });
        }

        const { credential, access_token } = req.body;
        let email, name, picture, googleId;

        if (credential) {
            const ticket = await googleClient.verifyIdToken({
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
            return res.status(400).json({ error: 'Missing Google Token' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Invalid Google Account' });
        }

        await connectDB();
        let user = await User.findOne({ email });

        if (!user) {
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
            if (!user.googleId) {
                user.googleId = googleId;
                user.isGoogleAccount = true;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        }

        const token = generateToken(user._id.toString(), user.email);
        setAuthCookie(res, token);

        res.json({
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
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

// Regular Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        await connectDB();
        const user = await User.findOne({ email });

        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user._id.toString(), user.email);
        setAuthCookie(res, token);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });
    } catch (error: any) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        await connectDB();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id.toString(), user.email);
        setAuthCookie(res, token);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });
    } catch (error: any) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        await connectDB();
        const user = await User.findById(currentUser.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });
    } catch (error: any) {
        console.error('Get User Error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
