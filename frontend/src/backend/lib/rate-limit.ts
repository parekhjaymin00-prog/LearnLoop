/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
}

/**
 * Default rate limit configs
 */
export const RATE_LIMITS = {
    LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    API: { maxAttempts: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address or email)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining attempts
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    if (!entry || now > entry.resetTime) {
        // First request or window expired
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        rateLimitStore.set(identifier, newEntry);
        return {
            allowed: true,
            remaining: config.maxAttempts - 1,
            resetTime: newEntry.resetTime,
        };
    }

    if (entry.count >= config.maxAttempts) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
        allowed: true,
        remaining: config.maxAttempts - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Get client identifier from request
 * Uses IP address or forwarded IP
 */
export function getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
}

/**
 * Format time remaining for rate limit reset
 */
export function formatResetTime(resetTime: number): string {
    const now = Date.now();
    const diff = resetTime - now;
    const minutes = Math.ceil(diff / 60000);

    if (minutes < 1) {
        return 'less than a minute';
    } else if (minutes === 1) {
        return '1 minute';
    } else {
        return `${minutes} minutes`;
    }
}
