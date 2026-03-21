import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | LearnLoop",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    At LearnLoop, we take your privacy seriously.
                </p>
                <p className="mb-4">
                    This privacy policy is currently a placeholder. Please check back later for the full details on how we collect, use, and protect your personal information on our platform.
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
