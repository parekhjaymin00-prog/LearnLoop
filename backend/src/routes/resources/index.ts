import { Router } from 'express';
import connectDB from '../../lib/db';
import Resource from '../../models/Resource';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

// GET /api/resources - Get all resources
router.get('/', async (req, res) => {
    try {
        await connectDB();
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json({ resources });
    } catch (error: any) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// POST /api/resources - Create a new resource
router.post('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { title, url, domain, topic, description } = req.body;

        if (!title || !url || !domain || !topic) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await connectDB();
        const resource = await Resource.create({
            title,
            url,
            domain,
            topic,
            description,
            addedBy: currentUser.email,
        });

        res.status(201).json({ message: 'Resource created', resource });
    } catch (error: any) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

// GET /api/resources/:resourceId - Get a specific resource
router.get('/:resourceId', async (req, res) => {
    try {
        const { resourceId } = req.params;
        await connectDB();

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.json({ resource });
    } catch (error: any) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

export default router;
