// Environment variables are handled automatically by Next.js
// in development (.env.local) and Vercel (Project Settings)

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;


