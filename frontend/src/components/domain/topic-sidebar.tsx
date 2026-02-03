"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { domainConfig } from "@/lib/domain-data";
import { ArrowLeft, Code2 } from "lucide-react";

export function TopicSidebar({
    className,
    domainSlug
}: {
    className?: string;
    domainSlug: string;
}) {
    const pathname = usePathname();
    const domain = domainConfig[domainSlug];

    // If domain isn't found (e.g. invalid URL), we can render a fallback or empty
    if (!domain) return null;

    return (
        <div className={cn("pb-12 h-screen border-r bg-muted/20", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href="/" className="mb-6 flex items-center gap-2 px-4 hover:opacity-80 transition-opacity">
                        <span className="text-2xl text-primary font-bold">∞</span>
                        <span className="font-bold text-lg">{domain.title}</span>
                    </Link>

                    <div className="space-y-1">
                        <Link href="/" className="px-4 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Back to Home
                        </Link>

                        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                            Topics
                        </h2>

                        <nav className="grid gap-1 px-2">
                            {domain.topics.map((topic, index) => {
                                const Icon = topic.icon || Code2;
                                const href = `/domains/${domainSlug}/${topic.slug}`;

                                return (
                                    <Button
                                        key={index}
                                        variant={pathname === href ? "secondary" : "ghost"}
                                        className="w-full justify-start gap-2"
                                        asChild
                                    >
                                        <Link href={href}>
                                            <Icon className="h-4 w-4" />
                                            {topic.name}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
