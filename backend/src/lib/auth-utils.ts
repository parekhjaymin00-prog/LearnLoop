import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string, email: string): string {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Set authentication cookie (Express)
 */
export function setAuthCookie(res: Response, token: string) {
    res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
        path: '/',
    });
}

/**
 * Get authentication token from cookie (Express)
 */
export function getAuthToken(req: Request): string | null {
    return req.cookies['auth-token'] || null;
}

/**
 * Clear authentication cookie (Express)
 */
export function clearAuthCookie(res: Response) {
    res.clearCookie('auth-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

/**
 * Get current user from token (Express)
 */
export function getCurrentUser(req: Request): { userId: string; email: string } | null {
    const token = getAuthToken(req);
    if (!token) return null;
    return verifyToken(token);
}

/**
 * Auth middleware for Express
 */
export function authMiddleware(req: Request, res: Response, next: any) {
    const user = getCurrentUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    (req as any).user = user;
    next();
}

