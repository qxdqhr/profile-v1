import { NextRequest, NextResponse } from 'next/server';
import { requireOssExampleAdmin } from '../_guard';
import { getOSSProvider } from '@/lib/examples/oss';

export async function GET(req: NextRequest) {
  const denied = await requireOssExampleAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') || '';
    const delimiter = searchParams.get('delimiter') || '/';
    
    const oss = await getOSSProvider();
    const result = await oss.listFiles(prefix, delimiter);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


