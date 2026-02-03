"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, AtSign, Save } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [settings, setSettings] = useState({
        notificationsEnabled: true,
        mentionsEnabled: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchSettings();
        }
    }, [user, isLoading]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/users/settings', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch('/api/users/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading settings...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/profile">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Profile
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account preferences
                    </p>
                </div>

                {/* Notifications Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Control when and how you receive notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label htmlFor="notifications">Enable Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications for mentions and replies to your comments
                                </p>
                            </div>
                            <Switch
                                id="notifications"
                                checked={settings.notificationsEnabled}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, notificationsEnabled: checked })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Mentions Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AtSign className="h-5 w-5" />
                            Mentions
                        </CardTitle>
                        <CardDescription>
                            Control who can mention you in comments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5 flex-1">
                                <Label htmlFor="mentions">Allow Mentions</Label>
                                <p className="text-sm text-muted-foreground">
                                    When disabled, other users cannot @mention you in comments
                                </p>
                            </div>
                            <Switch
                                id="mentions"
                                checked={settings.mentionsEnabled}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, mentionsEnabled: checked })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                    {saved && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                            ✓ Settings saved successfully
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
