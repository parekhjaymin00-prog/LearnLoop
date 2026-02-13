"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { NotificationsDropdown } from "./notifications-dropdown";

export function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8 text-primary">
                        <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
                    </svg>
                    <span className="hidden xs:inline sm:inline">LearnLoop</span>
                    <span className="inline xs:hidden sm:hidden">LL</span>
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
