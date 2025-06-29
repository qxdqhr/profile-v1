import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ideaLists, ideaItems } from '@/db/schema';
import { validateApiAuth } from '@/modules/auth/server';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, name, description, color, deleteOriginal } = await request.json();
    if (!itemId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 获取原始想法项目
    const originalItem = await db.query.ideaItems.findFirst({
      where: eq(ideaItems.id, itemId),
      with: {
        list: true
      }
    });

    if (!originalItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (originalItem.list.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 如果选择删除原始想法，先删除它
    if (deleteOriginal) {
      await db.delete(ideaItems).where(eq(ideaItems.id, itemId));
    }

    // 创建新的清单
    const [newList] = await db.insert(ideaLists).values({
      name,
      description: description || '',
      color: color || 'blue',
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // 创建第一个想法项目（从原始想法复制）
    await db.insert(ideaItems).values({
      title: originalItem.title,
      description: originalItem.description,
      isCompleted: false,
      listId: newList.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ list: newList });
  } catch (error) {
    console.error('Error converting idea to list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 