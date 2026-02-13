"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";
import { useUser } from "@/context/user-context";

export function Hero() {
    const { theme } = useTheme();
    const { user } = useUser();

    // Handle system theme preference which might return undefined initially or 'system'
    const particleColor = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? "#ffffff"
        : "#0f172a"; // Match slate-900 for high contrast

    return (
        <section className="relative w-full overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 bg-background">
            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">

                {/* Large Logo */}
                <ScrollReveal className="flex items-center justify-center gap-2 sm:gap-4 text-primary mb-6 sm:mb-8">
                    <motion.span
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="text-6xl sm:text-7xl md:text-9xl leading-none inline-block">∞</motion.span>
                    <span className="text-4xl sm:text-5xl md:text-8xl font-extrabold tracking-tight">LearnLoop</span>
                </ScrollReveal>

                {/* Tagline */}
                <ScrollReveal delay={0.1} className="mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
                        Learn. Share. <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Grow.</span>
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={0.2} className="mx-auto max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl mb-8 sm:mb-10 px-4">
                    <p>
                        The knowledge-sharing platform where unstructured chaos meets structured growth.
                        Dive into focused skills and master your craft.
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={0.3} className="flex flex-col sm:flex-row gap-4">
                    {user ? (
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 transition-transform hover:scale-105 active:scale-95" asChild>
                            <Link href="/#domains">Explore Skills</Link>
                        </Button>
                    ) : (
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 transition-transform hover:scale-105 active:scale-95" asChild>
                            <Link href="/login">Join LearnLoop</Link>
                        </Button>
                    )}
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 transition-transform hover:scale-105 active:scale-95" asChild>
                        <Link href="/#how-it-works">How it works</Link>
                    </Button>
                </ScrollReveal>
            </div>

            {/* Particles Background */}
            <Particles
                className="absolute inset-0 z-0 opacity-50 pointer-events-none"
                quantity={100}
                ease={80}
                color={particleColor}
                refresh
            />
        </section>
    );
}
