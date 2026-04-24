import { Router } from 'express';
import prisma from '../../lib/db';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

function extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) mentions.push(match[1]);
    return [...new Set(mentions)];
}

router.get('/', async (req, res) => {
    try {
        const { resourceId } = req.query;
        if (!resourceId) return res.status(400).json({ error: 'resourceId is required' });
        const comments = await prisma.comment.findMany({ where: { resourceId: resourceId as string }, orderBy: { createdAt: 'desc' } });
        return res.json({ comments });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { resourceId, content, parentCommentId, domain, topic } = req.body;
        if (!resourceId || !content || !domain || !topic) return res.status(400).json({ error: 'Missing required fields' });
        const author = currentUser.email;
        const rawMentions = extractMentions(content);
        const validMentions: string[] = [];
        for (const mention of rawMentions) {
            const mentionedUser = await prisma.user.findFirst({ where: { OR: [{ email: mention }, { name: mention }] } });
            if (mentionedUser && mentionedUser.mentionsEnabled) validMentions.push(mentionedUser.email);
        }
        const comment = await prisma.comment.create({
            data: { content, author, resourceId, parentCommentId: parentCommentId || null, mentions: validMentions, domain, topic },
        });
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        const resourceTitle = resource?.title || 'a resource';
        if (validMentions.length > 0) {
            const mentionNotifications = validMentions.filter(u => u !== author).map(username => ({ userId: username, type: 'mention', commentId: comment.id, resourceId, resourceTitle, triggeredBy: author, message: `${author} mentioned you in a comment on "${resourceTitle}"`, domain, topic }));
            if (mentionNotifications.length > 0) await prisma.notification.createMany({ data: mentionNotifications });
        }
        if (parentCommentId) {
            const parentComment = await prisma.comment.findUnique({ where: { id: parentCommentId } });
            if (parentComment && parentComment.author !== author) {
                await prisma.notification.create({ data: { userId: parentComment.author, type: 'reply', commentId: comment.id, resourceId, resourceTitle, triggeredBy: author, message: `${author} replied to your comment on "${resourceTitle}"`, domain, topic } });
            }
        }
        if (resource && resource.addedBy !== author) {
            await prisma.notification.create({ data: { userId: resource.addedBy, type: 'comment', commentId: comment.id, resourceId, resourceTitle, triggeredBy: author, message: `${author} commented on your resource "${resourceTitle}"`, domain, topic } });
        }
        return res.status(201).json({ message: 'Comment created', comment });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to create comment' });
    }
});

export default router;
