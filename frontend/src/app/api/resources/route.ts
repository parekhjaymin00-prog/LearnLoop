import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';
import { mockStore } from '@/lib/mock-store';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = searchParams.get('domain');
        const topic = searchParams.get('topic');

        console.log('📚 [RESOURCES/GET] Fetching resources:', { domain, topic });

        if (!domain || !topic) {
            return NextResponse.json({ error: 'Domain and topic are required' }, { status: 400 });
        }

        if (process.env.MOCK_MODE === 'true') {
            const resources = mockStore.getResources(domain, topic);
            return NextResponse.json({ resources });
        }

        await connectDB();

        const resources = await Resource.find({ domain, topic }).sort({ createdAt: -1 });

        console.log('✅ [RESOURCES/GET] Retrieved resources:', { count: resources.length, domain, topic });

        return NextResponse.json({ resources });
    } catch (error: any) {
        console.error('❌ [RESOURCES/GET] Error fetching resources:', error.message);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { title, type, url, size, addedBy, domain, topic } = await req.json();

        console.log('📚 [RESOURCES/POST] Creating resource:', { title, type, domain, topic });

        if (!title || !type || !domain || !topic || !addedBy) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (process.env.MOCK_MODE === 'true') {
            const newResource = mockStore.addResource({
                title,
                type,
                domain,
                topic,
                addedBy,
                url,
                size,
            });

            return NextResponse.json({
                message: 'Resource created successfully (Mock)',
                resource: newResource
            }, { status: 201 });
        }

        await connectDB();

        const newResource = await Resource.create({
            title,
            type,
            url,
            size,
            addedBy,
            domain,
            topic,
        });

        console.log('✅ [RESOURCES/POST] Resource created successfully:', { resourceId: newResource._id.toString(), title });

        return NextResponse.json({
            message: 'Resource created successfully',
            resource: newResource
        }, { status: 201 });

    } catch (error: any) {
        console.error('❌ [RESOURCES/POST] Error creating resource:', error.message);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
