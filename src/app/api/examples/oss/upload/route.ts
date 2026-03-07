import { NextRequest, NextResponse } from 'next/server';
import { getOSSProvider } from '@/lib/examples/oss';
import { UploadFileInfo } from 'sa2kit/universalFile/server/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;
    
    if (!file || !path) {
      return NextResponse.json({ error: 'File and path are required' }, { status: 400 });
    }
    
    const oss = await getOSSProvider();
    
    const fileInfo: UploadFileInfo = {
      file,
      moduleId: 'oss-manager',
      businessId: 'manual-upload',
    };
    
    const result = await oss.upload(fileInfo, path);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

