import { Suspense } from 'react';
import { ResourcesView } from "@/components/domain/resources-view";
import { ResourcesSkeleton } from "@/components/domain/resources-skeleton";
import { domainConfig } from "@/lib/domain-data";
import { notFound } from "next/navigation";
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';
import { mockStore } from '@/lib/mock-store';

interface PageProps {
    params: Promise<{
        domainSlug: string;
        topic: string;
    }>
}

async function getResources(domain: string, topic: string) {
    // Simulate network delay to demonstrate Suspense (optional, removed for prod)
    // await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        if (process.env.MOCK_MODE === 'true') {
            return mockStore.getResources(domain, topic);
        }

        await connectDB();
        // Use lean() to get plain objects
        const resources = await Resource.find({ domain, topic }).sort({ createdAt: -1 }).lean();

        // Serialize for Next.js Server Component props
        return JSON.parse(JSON.stringify(resources));
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
