import { Router } from 'express';
import prisma from '../../lib/db';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const resources = await prisma.resource.findMany({ where: { addedBy: user.email }, orderBy: { createdAt: 'desc' } });
        const totalResources = resources.length;
        const activeDomains = [...new Set(resources.map(r => r.domain))];
        const totalMentions = await prisma.notification.count({ where: { userId: user.email, type: 'mention' } });
        const groupedResources: Record<string, Record<string, any[]>> = {};
        resources.forEach(resource => {
            if (!groupedResources[resource.domain]) groupedResources[resource.domain] = {};
            if (!groupedResources[resource.domain][resource.topic]) groupedResources[resource.domain][resource.topic] = [];
            groupedResources[resource.domain][resource.topic].push(resource);
        });
        return res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt, isGoogleAccount: user.isGoogleAccount }, stats: { totalResources, totalMentions, activeDomains }, resources: groupedResources });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

router.put('/settings', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { name, avatar, notificationsEnabled, mentionsEnabled } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: { ...(name && { name }), ...(avatar && { avatar }), ...(typeof notificationsEnabled === 'boolean' && { notificationsEnabled }), ...(typeof mentionsEnabled === 'boolean' && { mentionsEnabled }) },
        });
        return res.json({ message: 'Settings updated successfully', user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, avatar: updatedUser.avatar, notificationsEnabled: updatedUser.notificationsEnabled, mentionsEnabled: updatedUser.mentionsEnabled } });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
