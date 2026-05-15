import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.SKILLS_READ_WRITE_TOKEN, 
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'video/mp4', 
            'video/quicktime', 
            'image/jpeg', 
            'image/png', 
            'video/x-matroska'
          ],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload finalizado:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}