import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';
import Resource from '@/models/Resource';
import User from '@/models/User';
import { mockStore } from '@/lib/mock-store';

// Helper function to extract @mentions from comment content
function extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
    }
    return [...new Set(mentions)]; // Remove duplicates
}

// GET - Fetch comments for a specific resource
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const resourceId = searchParams.get('resourceId');

        console.log('💬 [COMMENTS/GET] Fetching comments:', { resourceId });

        if (!resourceId) {
            return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
        }

        // Mock mode
        if (process.env.MOCK_MODE === 'true') {
            const comments = mockStore.getComments(resourceId);
            return NextResponse.json({ comments }, { status: 200 });
        }

        // Database mode
        await connectDB();
        const comments = await Comment.find({ resourceId }).sort({ createdAt: -1 });
        console.log('✅ [COMMENTS/GET] Retrieved comments:', { count: comments.length, resourceId });
        return NextResponse.json({ comments }, { status: 200 });
    } catch (error: any) {
        console.error('❌ [COMMENTS/GET] Error fetching comments:', error.message);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// POST - Create a new comment
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, author, resourceId, parentCommentId, domain, topic } = body;

        console.log('💬 [COMMENTS/POST] Creating comment:', { author, resourceId, parentCommentId });

        if (!content || !author || !resourceId || !domain || !topic) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Extract @mentions from content
        const mentions = extractMentions(content);

        // Mock mode
        if (process.env.MOCK_MODE === 'true') {
            // Create the comment
            const comment = mockStore.addComment({
                content,
                author,
                resourceId,
                parentCommentId: parentCommentId || null,
                mentions,
                domain,
                topic,
            });

            // Get resource title for notifications
            const resource = mockStore.getResourceById(resourceId);
            const resourceTitle = resource?.title || 'a resource';

            // Create notifications for @mentioned users
            if (mentions.length > 0) {
                mentions
                    .filter(username => username !== author)
                    .forEach(username => {
                        mockStore.addNotification({
                            userId: username,
                            type: 'mention',
                            commentId: comment._id,
                            resourceId,
                            resourceTitle,
                            triggeredBy: author,
                            message: `${author} mentioned you in a comment on "${resourceTitle}"`,
                            read: false,
                            domain,
                            topic,
                        });
                    });
            }

            // If this is a reply, notify the parent comment author
            if (parentCommentId) {
                const parentComment = mockStore.getCommentById(parentCommentId);
                if (parentComment && parentComment.author !== author) {
                    mockStore.addNotification({
                        userId: parentComment.author,
                        type: 'reply',
                        commentId: comment._id,
                        resourceId,
                        resourceTitle,
                        triggeredBy: author,
                        message: `${author} replied to your comment on "${resourceTitle}"`,
                        read: false,
                        domain,
                        topic,
                    });
                }
            }

            return NextResponse.json({ comment }, { status: 201 });
        }

        // Database mode
        await connectDB();

        // Extract @mentions and check if users allow mentions
        const allMentions = extractMentions(content);
        const validMentions: string[] = [];

        if (allMentions.length > 0) {
            // Check each mentioned user's settings
            for (const mention of allMentions) {
                const mentionedUser = await User.findOne({
                    $or: [
                        { email: mention },
                        { name: mention }
                    ]
                });

                // Only add mention if user exists and has mentions enabled
                if (mentionedUser && (mentionedUser.mentionsEnabled ?? true)) {
                    validMentions.push(mentionedUser.email);
                }
            }
        }

        // Create the comment with only valid mentions
        const comment = await Comment.create({
            content,
            author,
            resourceId,
            parentCommentId: parentCommentId || null,
            mentions: validMentions,
            domain,
            topic,
        });

        // Get resource title for notifications
        const resource = await Resource.findById(resourceId);
        const resourceTitle = resource?.title || 'a resource';

        // Create notifications for @mentioned users (only if they have mentions enabled)
        if (validMentions.length > 0) {
            const mentionNotifications = validMentions
                .filter(username => username !== author) // Don't notify yourself
                .map(username => ({
                    userId: username,
                    type: 'mention',
                    commentId: comment._id.toString(),
                    resourceId,
                    resourceTitle,
                    triggeredBy: author,
                    message: `${author} mentioned you in a comment on "${resourceTitle}"`,
                    domain,
                    topic,
                }));

            if (mentionNotifications.length > 0) {
                await Notification.insertMany(mentionNotifications);
            }
        }

        // If this is a reply, notify the parent comment author
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment && parentComment.author !== author) {
                await Notification.create({
                    userId: parentComment.author,
                    type: 'reply',
                    commentId: comment._id.toString(),
                    resourceId,
                    resourceTitle,
                    triggeredBy: author,
                    message: `${author} replied to your comment on "${resourceTitle}"`,
                    domain,
                    topic,
                });
            }
        }

        // Notify the resource owner (new feature!)
        if (resource && resource.addedBy !== author) {
            // Don't notify if the resource owner is commenting on their own resource
            await Notification.create({
                userId: resource.addedBy,
                type: 'comment',
                commentId: comment._id.toString(),
                resourceId,
                resourceTitle,
                triggeredBy: author,
                message: `${author} commented on your resource "${resourceTitle}"`,
                domain,
                topic,
            });
        }

        console.log('✅ [COMMENTS/POST] Comment created successfully:', { commentId: comment._id.toString(), author });

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error: any) {
        console.error('❌ [COMMENTS/POST] Error creating comment:', error.message);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
