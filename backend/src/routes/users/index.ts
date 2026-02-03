import { Router } from 'express';
import connectDB from '../../lib/db';
import User from '../../models/User';
import Resource from '../../models/Resource';
import Notification from '../../models/Notification';
import { authMiddleware } from '../../lib/auth-utils';

const router = Router();

// GET /api/users/:userId - Fetch user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await connectDB();

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resources = await Resource.find({ addedBy: user.email }).sort({ createdAt: -1 });
        const totalResources = resources.length;
        const activeDomains = [...new Set(resources.map(r => r.domain))];
        const totalMentions = await Notification.countDocuments({ userId: user.email, type: 'mention' });

        const groupedResources: Record<string, Record<string, any[]>> = {};
        resources.forEach(resource => {
            if (!groupedResources[resource.domain]) groupedResources[resource.domain] = {};
            if (!groupedResources[resource.domain][resource.topic]) groupedResources[resource.domain][resource.topic] = [];
            groupedResources[resource.domain][resource.topic].push(resource);
        });

        res.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
                isGoogleAccount: user.isGoogleAccount,
            },
            stats: { totalResources, totalMentions, activeDomains },
            resources: groupedResources,
        });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// PUT /api/users/settings - Update user settings
router.put('/settings', authMiddleware, async (req, res) => {
    try {
        const currentUser = (req as any).user;
        const { name, avatar } = req.body;

        await connectDB();
        const user = await User.findById(currentUser.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        await user.save();

        res.json({
            message: 'Settings updated successfully',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
