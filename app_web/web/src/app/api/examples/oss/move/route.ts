import { NextRequest, NextResponse } from 'next/server';
import { getOSSProvider } from '@/lib/examples/oss';

export async function POST(req: NextRequest) {
  try {
    const { sourcePath, targetPath } = await req.json();
    
    if (!sourcePath || !targetPath) {
      return NextResponse.json({ error: 'sourcePath and targetPath are required' }, { status: 400 });
    }
    
    const oss = await getOSSProvider();
    
    // OSS doesn't have a move command, so we copy and then delete
    const copyResult = await oss.copy(sourcePath, targetPath);
    
    if (copyResult.success) {
      await oss.delete(sourcePath);
      return NextResponse.json({ success: true, path: targetPath });
    } else {
      return NextResponse.json({ success: false, error: copyResult.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

