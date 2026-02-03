"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface UserStats {
    totalResources: number;
    totalMentions: number;
    activeDomains: string[];
}

interface GroupedResources {
    [domain: string]: {
        [topic: string]: any[];
    };
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const [userId, setUserId] = useState<string>("");
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [resources, setResources] = useState<GroupedResources>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        params.then(p => {
            setUserId(p.userId);
            fetchUserProfile(p.userId);
        });
    }, []);

    const fetchUserProfile = async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setStats(data.stats);
                setResources(data.resources);
            } else {
                // User not found
                router.push('/');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (!user) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>

                {/* Header */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-2xl">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Member since {formatDate(user.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Resources Shared
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats?.totalResources || 0}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mentioned In</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats?.totalMentions || 0}</p>
                            <p className="text-sm text-muted-foreground mt-1">discussions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats?.activeDomains.length || 0}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {stats?.activeDomains.join(', ') || 'None'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolio */}
                <Card>
                    <CardHeader>
                        <CardTitle>Portfolio</CardTitle>
                        <CardDescription>
                            Resources shared by {user.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(resources).length === 0 ? (
                            <p className="text-muted-foreground text-sm">No resources yet</p>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(resources).map(([domain, topics]) => (
                                    <div key={domain}>
                                        <h3 className="font-semibold capitalize mb-2">{domain}</h3>
                                        <div className="space-y-2 ml-4">
                                            {Object.entries(topics).map(([topic, items]) => (
                                                <div key={topic} className="flex items-center justify-between">
                                                    <Link
                                                        href={`/domains/${domain}/${topic}`}
                                                        className="text-sm hover:underline flex items-center gap-1"
                                                    >
                                                        {topic.replace(/-/g, ' ')}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                    <Badge variant="secondary">{items.length}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                        <Separator className="mt-3" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
