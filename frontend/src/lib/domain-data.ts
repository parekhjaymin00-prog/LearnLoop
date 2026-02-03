import {
    Globe, Cpu, Link as LinkIcon, Server, Lock, // Tech
    TrendingUp, LineChart, Wallet, Calculator, Coins, // Finance
    Palette, PenTool, Layout, type LucideIcon,
    Rocket, FileSearch, Briefcase, Monitor, // Career
    BookOpen, GraduationCap, Microscope, // Academics
    Zap, Clock, MessageCircle // General
} from "lucide-react";

export type Topic = {
    name: string;
    slug: string;
    icon: LucideIcon;
};

export type DomainData = {
    title: string;
    description: string;
    topics: Topic[];
};

export const domainConfig: Record<string, DomainData> = {
    "technology": {
        title: "Technology",
        description: "Master full-stack, AI, and more.",
        topics: [
            { name: "Full-Stack Dev", slug: "full-stack", icon: Globe },
            { name: "AI / ML", slug: "ai-ml", icon: Cpu },
            { name: "Blockchain", slug: "blockchain", icon: LinkIcon },
            { name: "DevOps", slug: "devops", icon: Server },
            { name: "Cybersecurity", slug: "cybersecurity", icon: Lock },
        ]
    },
    "finance": {
        title: "Finance",
        description: "Investing, Markets, Crypto. Analyze trends smartly.",
        topics: [
            { name: "Personal Finance", slug: "personal-finance", icon: Wallet },
            { name: "Stock Market", slug: "stock-market", icon: LineChart },
            { name: "Crypto", slug: "crypto", icon: Coins },
            { name: "Accounting", slug: "accounting", icon: Calculator },
        ]
    },
    "design": {
        title: "Design",
        description: "Design, UX/UI, Writing. Share your masterpiece.",
        topics: [
            { name: "UI / UX", slug: "ui-ux", icon: Layout },
            { name: "Graphic Design", slug: "graphic-design", icon: Palette },
            { name: "Product Design", slug: "product-design", icon: PenTool },
        ]
    },
    "career": {
        title: "Career",
        description: "Navigate your professional journey.",
        topics: [
            { name: "Resume Review", slug: "resume-review", icon: FileSearch },
            { name: "Interview Prep", slug: "interview-prep", icon: Briefcase },
            { name: "Freelancing", slug: "freelancing", icon: Monitor },
            { name: "Remote Jobs", slug: "remote-jobs", icon: Rocket },
        ]
    },
    "academics": {
        title: "Academics",
        description: "Study smarter with peer support.",
        topics: [
            { name: "Engineering", slug: "engineering", icon: Cpu },
            { name: "Medical", slug: "medical", icon: Microscope },
            { name: "Competitive Exams", slug: "competitive-exams", icon: GraduationCap },
        ]
    },
    "general-skills": {
        title: "General Skills",
        description: "Master the soft skills that matter.",
        topics: [
            { name: "Communication", slug: "communication", icon: MessageCircle },
            { name: "Productivity", slug: "productivity", icon: Zap },
            { name: "Time Management", slug: "time-management", icon: Clock },
        ]
    }
};
