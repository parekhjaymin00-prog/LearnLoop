/**
 * Centralized API client for making requests with consistent error handling and logging
 */

interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    status: number;
}

/**
 * Make an API request with consistent error handling and logging
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {} } = options;

    const isDevelopment = process.env.NODE_ENV === 'development';

    try {
        if (isDevelopment) {
            // Keep logs clean in production
            if (process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
                console.log(`🌐 [API] ${method} ${endpoint}`, body ? { body } : '');
            }
        }

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.error || `Request failed with status ${response.status}`;

            if (isDevelopment) {
                console.error(`❌ [API] ${method} ${endpoint} failed:`, {
                    status: response.status,
                    error: errorMessage,
                    data,
                });
            }

            return {
                error: errorMessage,
                status: response.status,
            };
        }

        if (isDevelopment) {
            console.log(`✅ [API] ${method} ${endpoint} success:`, data);
        }

        return {
            data,
            status: response.status,
        };
    } catch (error: any) {
        const errorMessage = error.message || 'Network error occurred';

        if (isDevelopment) {
            console.error(`❌ [API] ${method} ${endpoint} network error:`, {
                message: errorMessage,
                stack: error.stack,
            });
        }

        return {
            error: errorMessage,
            status: 0,
        };
    }
}

/**
 * Hook for managing loading states with API requests
 */
export function useApiRequest<T = any>() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);

    const execute = async (
        endpoint: string,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> => {
        setLoading(true);
        setError(null);

        const response = await apiRequest<T>(endpoint, options);

        if (response.error) {
            setError(response.error);
        } else {
            setData(response.data || null);
        }

        setLoading(false);
        return response;
    };

    const reset = () => {
        setLoading(false);
        setError(null);
        setData(null);
    };

    return { execute, loading, error, data, reset };
}

/**
 * React hook import
 */
import { useState } from 'react';
