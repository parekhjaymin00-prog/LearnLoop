import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileUrl = searchParams.get('url');
        let filename = searchParams.get('filename') || 'download';

        if (!fileUrl) {
            return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
        }

        // Fetch the file from the blob storage
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status });
        }

        // Get the file as a blob
        const blob = await response.blob();

        // Extract extension from URL if filename doesn't have one
        if (!filename.includes('.')) {
            const urlParts = fileUrl.split('/');
            const urlFilename = urlParts[urlParts.length - 1];
            const extensionMatch = urlFilename.match(/\.[^.]+$/);
            if (extensionMatch) {
                filename += extensionMatch[0];
            }
        }

        // Return the file with download headers
        return new NextResponse(blob, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
            },
        });
    } catch (error: any) {
        console.error('Download proxy error:', error);
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
}
