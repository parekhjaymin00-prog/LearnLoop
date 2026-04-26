import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('❌ [UPLOAD] Supabase upload error:', error);
            throw error;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('uploads')
            .getPublicUrl(filename);

        const fileUrl = publicUrlData.publicUrl;

        console.log('✅ [UPLOAD] File saved successfully to Supabase:', { filename, size: file.size });

        return NextResponse.json({
            success: true,
            url: fileUrl,
            filename: originalName,
            size: file.size,
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ [UPLOAD] File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
