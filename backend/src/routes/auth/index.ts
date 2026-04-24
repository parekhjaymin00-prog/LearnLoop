import { Router } from 'express';
import prisma from '../../lib/db';
import { authMiddleware, generateToken, hashPassword, comparePassword, setAuthCookie } from '../../lib/auth-utils';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, avatar: name.charAt(0).toUpperCase() },
        });
        const token = generateToken(newUser.id, newUser.email);
        setAuthCookie(res, token);
        return res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar } });
    } catch (error: any) {
        console.error('❌ [AUTH/REGISTER] Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
        const isValid = await comparePassword(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = generateToken(user.id, user.email);
        setAuthCookie(res, token);
        return res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error: any) {
        console.error('❌ [AUTH/LOGIN] Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const user = await prisma.user.findUnique({ where: { id: currentUser.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, isGoogleAccount: user.isGoogleAccount, notificationsEnabled: user.notificationsEnabled, mentionsEnabled: user.mentionsEnabled } });
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('auth-token');
    return res.json({ message: 'Logged out successfully' });
});

router.post('/google', async (req, res) => {
    try {
        const { googleId, email, name, avatar } = req.body;
        if (!googleId || !email) return res.status(400).json({ error: 'Missing required fields' });
        const user = await prisma.user.upsert({
            where: { email },
            update: { googleId, avatar, name },
            create: { email, name, avatar, googleId, isGoogleAccount: true },
        });
        const token = generateToken(user.id, user.email);
        setAuthCookie(res, token);
        return res.json({ message: 'Google authentication successful', user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
