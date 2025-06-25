import { NextRequest, NextResponse } from 'next/server';
import { saveSoundLibraryItem, getSoundLibraryFromDB, deleteSoundLibraryItem } from '../../services/databaseService';

// GET - 获取音效库列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');

    if (!configId) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    const soundLibrary = await getSoundLibraryFromDB(configId);
    return NextResponse.json(soundLibrary);
  } catch (error) {
    console.error('Failed to get sound library:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 添加音效库项目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configId, ...item } = body;

    if (!configId) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    await saveSoundLibraryItem(configId, item);
    return NextResponse.json({ success: true, message: 'Sound library item saved successfully' });
  } catch (error) {
    console.error('Failed to save sound library item:', error);
    return NextResponse.json({ error: 'Failed to save sound library item' }, { status: 500 });
  }
}

// PUT - 更新音效库项目
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { configId, ...item } = body;

    if (!configId) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 });
    }

    await saveSoundLibraryItem(configId, item);
    return NextResponse.json({ success: true, message: 'Sound library item updated successfully' });
  } catch (error) {
    console.error('Failed to update sound library item:', error);
    return NextResponse.json({ error: 'Failed to update sound library item' }, { status: 500 });
  }
}

// DELETE - 删除音效库项目
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await deleteSoundLibraryItem(itemId);
    return NextResponse.json({ success: true, message: 'Sound library item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete sound library item:', error);
    return NextResponse.json({ error: 'Failed to delete sound library item' }, { status: 500 });
  }
} 