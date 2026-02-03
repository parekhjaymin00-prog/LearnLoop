"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleProvider({ children }: { children: React.ReactNode }) {
    // Fallback to empty string to prevent build errors if env is missing, 
    // but auth won't work without it.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (!clientId) {
        console.error("Google Client ID is missing in environment variables!");
    } else {
        console.log("Google Client ID loaded:", clientId.substring(0, 10) + "...");
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
