import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | LearnLoop",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Welcome to LearnLoop. By using our platform, you agree to these terms.
                </p>
                <p className="mb-4">
                    These terms are currently a placeholder. Please check back later for the full terms of service regarding your usage of the platform, user-generated content, and community guidelines.
                </p>
                <div className="mt-8">
                    <Link href="/" className="text-primary hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
