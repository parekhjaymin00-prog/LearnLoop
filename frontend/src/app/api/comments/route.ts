import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) mentions.push(match[1]);
    return [...new Set(mentions)];
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const resourceId = searchParams.get('resourceId');
        if (!resourceId) return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
        const comments = await prisma.comment.findMany({ where: { resourceId }, orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ comments });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        const author = decoded.email;

        const { resourceId, content, parentCommentId, domain, topic } = await req.json();
        if (!resourceId || !content || !domain || !topic) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        const rawMentions = extractMentions(content);
        const validMentions: string[] = [];
        for (const mention of rawMentions) {
            const u = await prisma.user.findFirst({ where: { OR: [{ email: mention }, { name: mention }] } });
            if (u && u.mentionsEnabled) validMentions.push(u.email);
        }

        const comment = await prisma.comment.create({
            data: { content, author, resourceId, parentCommentId: parentCommentId || null, mentions: validMentions, domain, topic },
        });

        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        const resourceTitle = resource?.title || 'a resource';

        if (validMentions.length > 0) {
            await prisma.notification.createMany({ data: validMentions.filter(u => u !== author).map(username => ({ userId: username, type: 'mention', commentId: comment.id, resourceId, resourceTitle, triggeredBy: author, message: `${author} mentioned you in a comment on "${resourceTitle}"`, domain, topic })) });
        }
        if (parentCommentId) {
            const parent = await prisma.comment.findUnique({ where: { id: parentCommentId } });
            if (parent && parent.author !== author) {
                await prisma.notification.create({ data: { userId: parent.author, type: 'reply', commentId: comment.id, resourceId, resourceTitle, triggeredBy: author, message: `${author} replied to your comment on "${resourceTitle}"`, domain, topic } });
            }
        }
        if (resource && resource.addedBy !== author) {
            await prisma.notification.create({ data: { userId: resource.addedBy, type: 'comment', commentId: comment.id, resourceId, resourceTitle, triggeredBy: author, message: `${author} commented on your resource "${resourceTitle}"`, domain, topic } });
        }

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
