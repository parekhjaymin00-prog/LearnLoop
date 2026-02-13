"use client";

import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';

    useEffect(() => {
        if (!isLoading && user) {
            router.push(returnUrl);
        }
    }, [user, isLoading, router, returnUrl]);

    if (isLoading || user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin text-primary text-4xl">∞</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold md:text-xl">
                <span className="text-2xl text-primary font-bold">∞</span> LearnLoop
            </Link>
            <div className="w-full max-w-md animate-fade-in-up">
                <AuthForm returnUrl={returnUrl} />
            </div>
        </div>
    );
}
