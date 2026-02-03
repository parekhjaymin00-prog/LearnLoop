"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { NotificationsDropdown } from "./notifications-dropdown";

export function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-2xl text-primary">∞</span> LearnLoop
                </Link>

                <nav className="hidden md:flex gap-6">
                    <Link href="/#domains" className="text-sm font-medium hover:text-primary transition-colors">
                        Explore Skills
                    </Link>
                    <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                        How it Works
                    </Link>
                    <Link href="/#why-learnloop" className="text-sm font-medium hover:text-primary transition-colors">
                        Why LearnLoop
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    <NotificationsDropdown />
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
