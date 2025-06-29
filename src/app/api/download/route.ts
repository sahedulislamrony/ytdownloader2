import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return new NextResponse('Missing file name', { status: 400 });
  }

  // Security: Prevent directory traversal
  if (file.includes('/') || file.includes('..')) {
    return new NextResponse('Invalid file name', { status: 400 });
  }
  
  const downloadsDir = path.resolve(process.cwd(), 'downloads');
  const filePath = path.join(downloadsDir, file);

  try {
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const data: any = fs.createReadStream(filePath);
    
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${file}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
