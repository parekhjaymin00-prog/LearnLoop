import { Router } from 'express';
import connectDB from '../../lib/db';
import Comment from '../../models/Comment';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

// GET /api/comments?resourceId=xxx - Get comments for a resource
router.get('/', async (req, res) => {
    try {
        const { resourceId } = req.query;
        await connectDB();

        const comments = await Comment.find({ resourceId }).sort({ createdAt: -1 });
        res.json({ comments });
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// POST /api/comments - Create a new comment
router.post('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { resourceId, content } = req.body;

        if (!resourceId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await connectDB();
        const comment = await Comment.create({
            resourceId,
            content,
            authorEmail: currentUser.email,
        });

        res.status(201).json({ message: 'Comment created', comment });
    } catch (error: any) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

export default router;
