import { Router } from 'express';
import prisma from '../../lib/db';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { domain, topic } = req.query;
        const where: any = {};
        if (domain) where.domain = domain;
        if (topic) where.topic = topic;
        const resources = await prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' } });
        return res.json({ resources });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { title, type, url, size, domain, topic } = req.body;
        if (!title || !type || !domain || !topic) return res.status(400).json({ error: 'Missing required fields' });
        const resource = await prisma.resource.create({
            data: { title, type, url, size, domain, topic, addedBy: currentUser.email },
        });
        return res.status(201).json({ message: 'Resource created successfully', resource });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to create resource' });
    }
});

router.get('/:resourceId', async (req, res) => {
    try {
        const { resourceId } = req.params;
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        return res.json({ resource });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

router.delete('/:resourceId', authMiddleware, async (req, res) => {
    try {
        const { resourceId } = req.params;
        const currentUser = (req as any).user;
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        if (resource.addedBy !== currentUser.email) return res.status(403).json({ error: 'Not authorized' });
        await prisma.resource.delete({ where: { id: resourceId } });
        return res.json({ message: 'Resource deleted successfully' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to delete resource' });
    }
});

export default router;
