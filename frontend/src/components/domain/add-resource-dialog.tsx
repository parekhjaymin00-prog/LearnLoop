"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/context/user-context";

interface AddResourceDialogProps {
    domainSlug: string;
    topicSlug: string;
    onResourceAdded: (resource: any) => void;
}

export default function AddResourceDialog({ domainSlug, topicSlug, onResourceAdded }: AddResourceDialogProps) {
    const { user } = useUser();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [newItemTitle, setNewItemTitle] = React.useState("");
    const [newItemType, setNewItemType] = React.useState<"link" | "file">("link");
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [linkUrl, setLinkUrl] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleAddResource = async () => {
        if (!newItemTitle) return;
        if (newItemType === "file" && !selectedFile) return;
        if (newItemType === "link" && !linkUrl) return;

        setIsSubmitting(true);
        try {
            let fileUrl = linkUrl;

            if (newItemType === "file" && selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadRes.ok) throw new Error('Failed to upload file');
                const uploadData = await uploadRes.json();
                fileUrl = uploadData.url;
            }

            const resourceData = {
                title: newItemTitle,
                type: newItemType,
                addedBy: user?.name || "Anonymous",
                domain: domainSlug,
                topic: topicSlug,
                url: fileUrl,
                size: newItemType === "file" && selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : undefined,
            };

            const res = await fetch("/api/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(resourceData),
            });

            if (res.ok) {
                const data = await res.json();
                onResourceAdded(data.resource);
                setNewItemTitle("");
                setLinkUrl("");
                setSelectedFile(null);
                setIsDialogOpen(false);
            }
        } catch (err) {
            console.error("Failed to add resource:", err);
            alert('Failed to add resource. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleAddResourceClick = () => {
        if (!user) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?returnUrl=${returnUrl}`;
            return;
        }
        setIsDialogOpen(true);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    className="hover:scale-105 transition-transform"
                    onClick={(e) => {
                        e.preventDefault();
                        handleAddResourceClick();
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Resource</DialogTitle>
                    <DialogDescription>
                        {newItemType === 'file' ? "Upload a file from your device." : "Share a helpful link."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <div className="flex gap-2">
                            <Button variant={newItemType === 'link' ? 'default' : 'outline'} onClick={() => setNewItemType('link')} className="flex-1">Link</Button>
                            <Button variant={newItemType === 'file' ? 'default' : 'outline'} onClick={() => setNewItemType('file')} className="flex-1">File</Button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="e.g. Project Documentation" />
                    </div>

                    {newItemType === 'link' ? (
                        <div className="grid gap-2" key="link-mode">
                            <Label htmlFor="url">URL</Label>
                            <Input id="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" />
                        </div>
                    ) : (
                        <div className="grid gap-2" key="file-mode">
                            <Label htmlFor="file">File</Label>
                            <Input id="file" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleAddResource} disabled={isSubmitting}>
                        {isSubmitting ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
