"use client";

import * as React from "react";
import { MessageCircle, Reply, Send } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Comment {
    _id: string;
    content: string;
    author: string;
    resourceId: string;
    parentCommentId: string | null;
    mentions: string[];
    createdAt: string;
}

interface ResourceCommentsProps {
    resourceId: string;
    resourceTitle: string;
    domain: string;
    topic: string;
}

export function ResourceComments({ resourceId, resourceTitle, domain, topic }: ResourceCommentsProps) {
    const { user } = useUser();
    const router = useRouter();
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [newComment, setNewComment] = React.useState("");
    const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
    const [replyContent, setReplyContent] = React.useState("");

    React.useEffect(() => {
        fetchComments();
    }, [resourceId]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/comments?resourceId=${resourceId}`);
            const data = await res.json();
            if (data.comments) {
                setComments(data.comments);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async () => {
        console.log('=== handleAddComment called ===');
        console.log('newComment:', newComment);
        console.log('user:', user);
        console.log('resourceId:', resourceId);
        console.log('domain:', domain);
        console.log('topic:', topic);

        if (!newComment.trim()) {
            console.log('Comment is empty, returning');
            return;
        }

        if (!user) {
            console.log('User not logged in, redirecting to login');
            router.push("/login");
            return;
        }

        const commentData = {
            content: newComment,
            author: user.name, // Use name for privacy (not email)
            resourceId,
            domain,
            topic,
        };

        console.log('Sending comment data:', commentData);

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(commentData)
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                console.log('Comment added successfully!');
                setComments([data.comment, ...comments]);
                setNewComment("");
            } else {
                console.error('Failed to add comment:', data.error);
                alert(data.error || 'Failed to add comment');
            }
        } catch (err) {
            console.error("Failed to add comment:", err);
            alert('Failed to add comment. Please try again.');
        }
    };

    const handleAddReply = async (parentCommentId: string) => {
        if (!replyContent.trim()) return;

        if (!user) {
            router.push("/login");
            return;
        }

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    content: replyContent,
                    author: user.name, // Use name for privacy
                    resourceId,
                    parentCommentId,
                    domain,
                    topic,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setComments([data.comment, ...comments]);
                setReplyContent("");
                setReplyingTo(null);
            } else {
                console.error('Failed to add reply:', data.error);
                alert(data.error || 'Failed to add reply');
            }
        } catch (err) {
            console.error("Failed to add reply:", err);
            alert('Failed to add reply. Please try again.');
        }
    };

    // Highlight @mentions in comment content
    const highlightMentions = (content: string) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('@')) {
                const username = part.substring(1); // Remove @ symbol
                return (
                    <span key={idx} className="text-blue-500 dark:text-blue-400 font-semibold">
                        {part}
                    </span>
                );
            }
            return <span key={idx}>{part}</span>;
        });
    };

    // Separate top-level comments and replies
    const topLevelComments = comments.filter(c => !c.parentCommentId);
    const getReplies = (commentId: string) => comments.filter(c => c.parentCommentId === commentId);

    return (
        <div className="space-y-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="h-4 w-4" />
                <span>Comments ({comments.length})</span>
            </div>

            {/* Add Comment Input */}
            <div className="space-y-2">
                <Textarea
                    placeholder={user ? "Add a comment... Use @username to mention someone" : "Login to comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={() => !user && router.push("/login")}
                    className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                    <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                    >
                        <Send className="h-3 w-3 mr-2" />
                        Comment
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground animate-pulse">
                    <p>Loading comments...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {topLevelComments.map((comment) => {
                        const replies = getReplies(comment._id);
                        return (
                            <div key={comment._id} className="space-y-3">
                                {/* Top-level Comment */}
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback className="text-xs">
                                            {comment.author.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Link
                                                href={`/users/${comment.author}`}
                                                className="font-semibold text-foreground hover:text-primary hover:underline cursor-pointer"
                                            >
                                                {comment.author}
                                            </Link>
                                            <span className="text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-sm bg-muted/50 rounded-lg px-3 py-2">
                                            {highlightMentions(comment.content)}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setReplyingTo(comment._id)}
                                        >
                                            <Reply className="h-3 w-3 mr-1" />
                                            Reply
                                        </Button>
                                    </div>
                                </div>

                                {/* Replies */}
                                {replies.length > 0 && (
                                    <div className="ml-11 space-y-3 border-l-2 pl-4">
                                        {replies.map((reply) => (
                                            <div key={reply._id} className="flex gap-3">
                                                <Avatar className="h-7 w-7 border">
                                                    <AvatarFallback className="text-xs">
                                                        {reply.author.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Link
                                                            href={`/users/${reply.author}`}
                                                            className="font-semibold text-foreground hover:text-primary hover:underline cursor-pointer"
                                                        >
                                                            {reply.author}
                                                        </Link>
                                                        <span className="text-muted-foreground">
                                                            {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm bg-muted/30 rounded-lg px-3 py-2">
                                                        {highlightMentions(reply.content)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply Input */}
                                {replyingTo === comment._id && (
                                    <div className="ml-11 space-y-2">
                                        <Textarea
                                            placeholder={`Reply to ${comment.author}... Use @username to mention`}
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            className="min-h-[60px] resize-none text-sm"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyContent("");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => handleAddReply(comment._id)}
                                                disabled={!replyContent.trim()}
                                                size="sm"
                                            >
                                                <Send className="h-3 w-3 mr-2" />
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
