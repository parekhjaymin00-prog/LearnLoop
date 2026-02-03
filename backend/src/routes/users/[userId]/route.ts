import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Resource from '@/models/Resource';
import Notification from '@/models/Notification';

// GET - Fetch user profile with stats and resources
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        await connectDB();

        // Get user info
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all resources by this user
        const resources = await Resource.find({ addedBy: user.email })
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalResources = resources.length;

        // Get unique domains
        const activeDomains = [...new Set(resources.map(r => r.domain))];

        // Count mentions received
        const totalMentions = await Notification.countDocuments({
            userId: user.email,
            type: 'mention'
        });

        // Group resources by domain and topic
        const groupedResources: Record<string, Record<string, any[]>> = {};
        resources.forEach(resource => {
            if (!groupedResources[resource.domain]) {
                groupedResources[resource.domain] = {};
            }
            if (!groupedResources[resource.domain][resource.topic]) {
                groupedResources[resource.domain][resource.topic] = [];
            }
            groupedResources[resource.domain][resource.topic].push(resource);
        });

        return NextResponse.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
                isGoogleAccount: user.isGoogleAccount,
            },
            stats: {
                totalResources,
                totalMentions,
                activeDomains,
            },
            resources: groupedResources,
        });

    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}
