import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 * - At least 8 characters
 * - Contains at least one number
 * - Contains at least one letter
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter');

/**
 * Name validation schema
 */
export const nameSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

/**
 * Registration validation schema
 */
export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

/**
 * Validate registration data
 */
export function validateRegistration(data: { name: string; email: string; password: string }) {
    return registerSchema.safeParse(data);
}

/**
 * Validate login data
 */
export function validateLogin(data: { email: string; password: string }) {
    return loginSchema.safeParse(data);
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
