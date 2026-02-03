import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                {/* Title skeleton */}
                <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
                {/* Description skeleton */}
                <div className="h-5 w-full max-w-2xl bg-muted animate-pulse rounded-md" />
                <div className="h-5 w-2/3 bg-muted animate-pulse rounded-md" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    {/* Section title skeleton */}
                    <div className="space-y-2">
                        <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-60 bg-muted animate-pulse rounded-md" />
                    </div>
                    {/* Button skeleton */}
                    <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
                </div>

                {/* Resources Grid Skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="flex flex-col h-[200px]">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                                <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col space-y-4 pt-4">
                                <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md" />
                                <div className="space-y-2 mt-auto">
                                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded-md" />
                                    <div className="h-3 w-1/3 bg-muted animate-pulse rounded-md" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
