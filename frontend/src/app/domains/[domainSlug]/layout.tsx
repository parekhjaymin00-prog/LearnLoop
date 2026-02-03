import { UserNav } from "@/components/layout/user-nav";
import { TopicSidebar } from "@/components/domain/topic-sidebar";
import { domainConfig } from "@/lib/domain-data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ domainSlug: string }> }): Promise<Metadata> {
    const { domainSlug } = await params;
    const domain = domainConfig[domainSlug];
    if (!domain) return { title: "Not Found" };

    return {
        title: `${domain.title} | LearnLoop`,
        description: domain.description,
    };
}

export default async function DomainLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domainSlug: string }>;
}) {
    const { domainSlug } = await params;
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Dynamic based on params */}
            <TopicSidebar className="hidden w-64 md:block shrink-0" domainSlug={domainSlug} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 justify-end">
                    <UserNav />
                </header>
                <main className="flex-1 p-6 lg:p-10 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
