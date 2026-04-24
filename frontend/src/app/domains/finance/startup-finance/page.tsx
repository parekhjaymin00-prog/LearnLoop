import { Suspense } from 'react';
import { ResourcesView } from "@/components/domain/resources-view";
import { ResourcesSkeleton } from "@/components/domain/resources-skeleton";
import { domainConfig } from "@/lib/domain-data";
import { notFound } from "next/navigation";

import { Metadata } from 'next';

const DOMAIN_SLUG = "finance";
const TOPIC_SLUG = "startup-finance";

export const metadata: Metadata = {
    title: "Startup Finance | Finance | LearnLoop",
    description: "Share resources and collaborate with the community to learn about Startup Finance in the Finance domain on LearnLoop.",
};

async function getResources(domain: string, topic: string) {
    try {
        const res = await fetch(`http://localhost:5000/api/resources?domain=${domain}&topic=${topic}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch from backend');
        const data = await res.json();
        return data.resources || [];
    } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
}

async function ResourcesLoader({ domainSlug, topic }: { domainSlug: string, topic: string }) {
    const resources = await getResources(domainSlug, topic);

    return (
        <ResourcesView
            domainSlug={domainSlug}
            topicSlug={topic}
            initialResources={resources}
        />
    );
}

export default function StartupFinancePage() {
    const domain = domainConfig[DOMAIN_SLUG];
    if (!domain) return notFound();

    const topicConfig = domain.topics.find(t => t.slug === TOPIC_SLUG);
    const topicTitle = topicConfig ? topicConfig.name : "Startup Finance";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{topicTitle}</h1>
                <p className="text-muted-foreground">
                    Share resources and collaborate with the community. Comment on resources to discuss and help each other learn about {topicTitle} in the {domain.title} domain.
                </p>
            </div>

            <Suspense fallback={<ResourcesSkeleton />}>
                <ResourcesLoader domainSlug={DOMAIN_SLUG} topic={TOPIC_SLUG} />
            </Suspense>
        </div>
    );
}
