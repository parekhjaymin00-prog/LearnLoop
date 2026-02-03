import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth-utils';

// DELETE - Delete a resource (only by owner)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ resourceId: string }> }
) {
    try {
        const { resourceId } = await params;

        // Get token from cookies
        const token = req.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = verifyToken(token);
        if (!userData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await connectDB();

        // Get user to access their name (JWT only has userId and email)
        const user = await User.findOne({ email: userData.email }).select('name email');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the resource
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // Check if the user is the owner
        // SECURITY: Primary check is email (unique), name is fallback for old resources only
        const isOwner = resource.addedBy === userData.email ||
            resource.addedBy === userData.userId ||
            (resource.addedBy === user.name && user.email === userData.email); // Only allow name match if emails also match

        if (!isOwner) {
            console.log('Delete denied:', {
                resourceOwner: resource.addedBy,
                userEmail: userData.email,
                userId: userData.userId,
                userName: user.name
            });
            return NextResponse.json({ error: 'You can only delete your own resources' }, { status: 403 });
        }

        // Delete the resource
        await Resource.findByIdAndDelete(resourceId);

        return NextResponse.json({ message: 'Resource deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Error deleting resource:', error);
        return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }
}
