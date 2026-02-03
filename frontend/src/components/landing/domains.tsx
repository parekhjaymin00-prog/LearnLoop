"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Note: I might need to add Badge component if I haven't
import { Laptop, TrendingUp, Palette, Rocket, BookOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Fallback badge style if Shadcn Badge isn't installed yet, or I'll add it.
// I'll assume standard div for badges for now to avoid dependency on Badge component if not added.

const domains = [
    {
        title: "Technology",
        href: "/domains/technology/full-stack",
        icon: Laptop,
        description: "Web dev, AI, Blockchain. Code and build together.",
        topics: ["Full-Stack", "AI / ML", "Blockchain", "DevOps", "Cybersecurity"],
    },
    {
        title: "Finance",
        href: "/domains/finance/personal-finance",
        icon: TrendingUp,
        description: "Investing, Markets, Crypto. Analyze trends smartly.",
        topics: ["Personal Finance", "Stock Market", "Crypto", "Accounting Basics", "Startup Finance"],
    },
    {
        title: "Design",
        href: "/domains/design/ui-ux",
        icon: Palette,
        description: "Design, UX/UI, Writing. Share your masterpiece.",
        topics: ["UI/UX", "Graphic Design", "Product Design"],
    },
    {
        title: "Career",
        href: "/domains/career/resume-review",
        icon: Rocket,
        description: "Navigate your professional journey.",
        topics: ["Resume Review", "Interview Prep", "Freelancing", "Remote Jobs"],
    },
    {
        title: "Academics",
        href: "/domains/academics/engineering",
        icon: BookOpen,
        description: "Study smarter with peer support.",
        topics: ["Engineering", "Medical", "Competitive Exams"],
    },
    {
        title: "General Skills",
        href: "/domains/general-skills/communication",
        icon: Zap,
        description: "Master the soft skills that matter.",
        topics: ["Communication", "Productivity", "Time Management"],
    },
];

export function Domains() {
    return (
        <section id="domains" className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore interested skills</h2>
                    <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                        Focused discussions. No noise. Just knowledge.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {domains.map((domain, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={domain.href} className="block h-full">
                                <Card className="group relative overflow-hidden transition-all h-full border-muted-foreground/10 hover:border-primary/50">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                    <CardHeader className="relative z-10">
                                        <domain.icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                                    </CardHeader>
                                    <CardContent className="relative z-10 flex flex-col h-full pb-16">
                                        <CardTitle className="mb-2 text-xl group-hover:text-primary transition-colors">{domain.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {domain.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50 group-hover:border-primary/20">
                                            {domain.topics.map((topic, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-default bg-background"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-primary"
                                        initial={{ width: "0%" }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
