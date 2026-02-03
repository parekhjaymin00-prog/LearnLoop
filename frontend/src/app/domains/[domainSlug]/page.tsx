import { redirect, notFound } from "next/navigation";
import { domainConfig } from "@/lib/domain-data";

export default async function DomainIndex({ params }: { params: Promise<{ domainSlug: string }> }) {
    const { domainSlug } = await params;
    const domain = domainConfig[domainSlug];

    if (!domain) {
        return notFound();
    }

    // Redirect to the first topic of the domain
    const firstTopic = domain.topics[0];
    redirect(`/domains/${domainSlug}/${firstTopic.slug}`);
}
