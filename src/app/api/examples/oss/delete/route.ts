import { NextRequest, NextResponse } from 'next/server';
import { getOSSProvider } from '@/lib/examples/oss';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }
    
    const oss = await getOSSProvider();
    const result = await oss.delete(path);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { paths } = await req.json();
    
    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: 'Paths array is required' }, { status: 400 });
    }
    
    const oss = await getOSSProvider();
    const result = await oss.batchDelete(paths);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

