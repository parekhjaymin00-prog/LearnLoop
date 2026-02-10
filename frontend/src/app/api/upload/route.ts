import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;

        // Upload to Vercel Blob Storage
        const blob = await put(filename, file, {
            access: 'public',
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
            filename: originalName,
            size: file.size,
        }, { status: 200 });

    } catch (error: any) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

