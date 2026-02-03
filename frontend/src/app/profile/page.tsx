"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Bell, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

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

export default function ProfilePage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [resources, setResources] = useState<GroupedResources>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchProfileData();
            fetchNotifications();
        }
    }, [user, isLoading]);

    const fetchProfileData = async () => {
        try {
            const res = await fetch(`/api/users/${encodeURIComponent(user?.email || '')}`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                setStats(data.stats);
                setResources(data.resources);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?userId=${encodeURIComponent(user?.email || '')}`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications.slice(0, 5)); // Show only recent 5
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        // Mark as read
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    notificationIds: [notification._id],
                    userId: user?.email,
                }),
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }

        // Navigate to the comment
        router.push(`/domains/${notification.domain}/${notification.topic}?resource=${notification.resourceId}#comment-${notification.commentId}`);
    };

    if (isLoading || loading) {
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
                                <p className="text-muted-foreground">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Member since {userData?.createdAt ? formatDate(userData.createdAt) : 'recently'}</span>
                                </div>
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/settings">Settings</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Total Resources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats?.totalResources || 0}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                Mentions Received
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{stats?.totalMentions || 0}</p>
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

                <div className="grid md:grid-cols-2 gap-6">
                    {/* My Resources */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Resources</CardTitle>
                            <CardDescription>
                                Resources you've shared across all domains
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

                    {/* Recent Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notifications</CardTitle>
                            <CardDescription>
                                Latest mentions and replies
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No notifications</p>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''
                                                }`}
                                        >
                                            <p className="text-sm">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
