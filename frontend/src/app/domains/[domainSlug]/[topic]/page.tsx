import { Suspense } from 'react';
import { ResourcesView } from "@/components/domain/resources-view";
import { ResourcesSkeleton } from "@/components/domain/resources-skeleton";
import { domainConfig } from "@/lib/domain-data";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        domainSlug: string;
        topic: string;
    }>
}

import { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { domainSlug, topic } = await params;
    const domain = domainConfig[domainSlug];
    if (!domain) return { title: "Not Found" };
    
    const topicConfig = domain.topics.find(t => t.slug === topic);
    const topicTitle = topicConfig ? topicConfig.name : topic;

    return {
        title: `${topicTitle} | ${domain.title} | LearnLoop`,
        description: `Share resources and collaborate with the community to learn about ${topicTitle} in the ${domain.title} domain on LearnLoop.`,
    };
}

async function getResources(domain: string, topic: string) {
    // Simulate network delay to demonstrate Suspense (optional, removed for prod)
    // await new Promise(resolve => setTimeout(resolve, 1000));

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

export default async function TopicPage({ params }: PageProps) {
    const { domainSlug, topic } = await params;

    const domain = domainConfig[domainSlug];
    if (!domain) return notFound();

    const topicConfig = domain.topics.find(t => t.slug === topic);
    const topicTitle = topicConfig ? topicConfig.name : topic;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{topicTitle}</h1>
                <p className="text-muted-foreground">
                    Share resources and collaborate with the community. Comment on resources to discuss and help each other learn about {topicTitle} in the {domain.title} domain.
                </p>
            </div>

            <Suspense fallback={<ResourcesSkeleton />}>
                <ResourcesLoader domainSlug={domainSlug} topic={topic} />
            </Suspense>
        </div>
    );
}
