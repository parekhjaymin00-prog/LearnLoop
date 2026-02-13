"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceComments } from "./resource-comments";
import dynamic from "next/dynamic";
import { Plus, FileText, Link as LinkIcon, Download, MessageCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useUser } from "@/context/user-context";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Lazy load the dialog component - critical for initial load performance
const AddResourceDialog = dynamic(() => import('./add-resource-dialog'), {
    loading: () => (
        <Button className="hover:scale-105 transition-transform opacity-80 cursor-wait">
            <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
    ),
    ssr: false
});

interface Resource {
    _id?: string;
    id?: string;
    title: string;
    type: "link" | "file";
    addedBy: string;
    date: string;
    url?: string;
    size?: string;
}

interface ResourcesViewProps {
    domainSlug: string;
    topicSlug: string;
    initialResources?: Resource[];
}

export function ResourcesView({ domainSlug, topicSlug, initialResources = [] }: ResourcesViewProps) {
    const { user } = useUser();
    const [resources, setResources] = React.useState<Resource[]>(initialResources);
    const [isLoading, setIsLoading] = React.useState(initialResources.length === 0);
    const [expandedResourceId, setExpandedResourceId] = React.useState<string | null>(null);

    React.useEffect(() => {
        // If we have initial resources, we don't need to fetch immediately
        if (initialResources.length > 0) {
            setIsLoading(false);
        } else {
            const fetchResources = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/resources?domain=${domainSlug}&topic=${topicSlug}`);
                    const data = await res.json();
                    if (data.resources) {
                        setResources(data.resources);
                    }
                } catch (err) {
                    console.error("Failed to fetch resources:", err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchResources();
        }
    }, [domainSlug, topicSlug, initialResources.length]);

    const handleResourceAdded = (newResource: Resource) => {
        setResources([newResource, ...resources]);
    };

    const toggleComments = (resourceId: string) => {
        setExpandedResourceId(expandedResourceId === resourceId ? null : resourceId);
    };

    const handleDelete = async (resourceId: string) => {
        try {
            const res = await fetch(`/api/resources/${resourceId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                // Remove from local state
                setResources(resources.filter(r => (r._id || r.id) !== resourceId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete resource');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete resource');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Shared Resources</h3>
                    <p className="text-sm text-muted-foreground">
                        Files, links, and notes shared by the community. Comment to discuss!
                    </p>
                </div>
                <AddResourceDialog
                    domainSlug={domainSlug}
                    topicSlug={topicSlug}
                    onResourceAdded={handleResourceAdded}
                />
            </div>

            {isLoading ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground animate-pulse">
                    <p>Loading resources...</p>
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    <p>No resources yet. Be the first to add one!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource, idx) => {
                        const resourceId = resource._id || resource.id || `resource-${idx}`;
                        const isExpanded = expandedResourceId === resourceId;

                        return (
                            <Card key={resourceId} className="group relative overflow-hidden transition-all hover:shadow-md flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="p-2 bg-muted rounded-full">
                                        {resource.type === "link" ? <LinkIcon className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-orange-500" />}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* Download/Link Button - Always Visible and Clickable */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-foreground hover:bg-accent"
                                            onClick={async () => {
                                                console.log('Download clicked for resource:', {
                                                    title: resource.title,
                                                    type: resource.type,
                                                    url: resource.url,
                                                    hasUrl: !!resource.url
                                                });

                                                if (!resource.url) {
                                                    alert(`Cannot download "${resource.title}". This resource doesn't have a download URL.\n\nNote: File uploads are not fully implemented yet. Only link-type resources can be downloaded.`);
                                                    return;
                                                }

                                                // For file downloads, fetch as blob and trigger download
                                                if (resource.type === 'file') { const link = document.createElement('a'); link.href = resource.url; link.download = resource.title || 'download'; link.target = '_blank'; link.rel = 'noopener noreferrer'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } else {
                                                    // For links, open in new tab
                                                    console.log('Opening link in new tab:', resource.url);
                                                    window.open(resource.url, '_blank');
                                                }
                                            }}
                                            title={resource.url ? (resource.type === 'link' ? 'Open link' : 'Download file') : 'No URL available'}
                                        >
                                            {resource.type === 'link' ? <LinkIcon className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                                        </Button>
                                        {/* Delete Button - Only for resource owner */}
                                        {user && (resource.addedBy === user.email || resource.addedBy === user.name) && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                                                        title="Delete resource"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(resourceId)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <CardTitle className="text-base line-clamp-1">{resource.title}</CardTitle>
                                    <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            Added by <span className="font-medium text-foreground">{resource.addedBy}</span>
                                        </span>
                                        <span>{resource.date ? new Date(resource.date).toLocaleDateString() : new Date().toLocaleDateString()} • {resource.type === "file" ? resource.size : "External Link"}</span>
                                    </div>

                                    {/* Comments Toggle Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-4 w-full justify-center"
                                        onClick={() => toggleComments(resourceId)}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        {isExpanded ? 'Hide Comments' : 'View Comments'}
                                        {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                                    </Button>

                                    {/* Expandable Comments Section */}
                                    {isExpanded && (
                                        <ResourceComments
                                            resourceId={resourceId}
                                            resourceTitle={resource.title}
                                            domain={domainSlug}
                                            topic={topicSlug}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
