import { NextRequest, NextResponse } from 'next/server';
import {
  createExamType,
  deleteExamType,
  listExamTypeDetails,
  listExamTypeIds,
  updateExamType,
} from '@/modules/exam/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withDetails = searchParams.get('details') === 'true';

    if (withDetails) {
      const details = await listExamTypeDetails();
      return NextResponse.json(details);
    }

    const ids = await listExamTypeIds();
    return NextResponse.json(ids);
  } catch (error) {
    console.error('获取试卷类型失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    const type = await createExamType({ id, name, description });

    return NextResponse.json({
      success: true,
      message: `试卷类型 ${id} 已创建`,
      type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN';

    if (message === 'INVALID_PAYLOAD') {
      return NextResponse.json({ error: '试卷ID和名称是必需的' }, { status: 400 });
    }

    if (message === 'INVALID_ID_FORMAT') {
      return NextResponse.json(
        { error: '试卷ID格式不正确，只能包含小写字母、数字、下划线和连字符' },
        { status: 400 }
      );
    }

    if (message === 'EXAM_TYPE_EXISTS') {
      return NextResponse.json({ error: '此试卷ID已存在' }, { status: 409 });
    }

    console.error('创建试卷类型失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';

    await deleteExamType(id);

    return NextResponse.json({
      success: true,
      message: `试卷类型 ${id} 已删除`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN';

    if (message === 'MISSING_TYPE_ID') {
      return NextResponse.json({ error: '试卷ID是必需的' }, { status: 400 });
    }

    if (message === 'PROTECTED_EXAM_TYPE') {
      return NextResponse.json({ error: '系统默认试卷不能删除' }, { status: 403 });
    }

    if (message === 'EXAM_TYPE_NOT_FOUND') {
      return NextResponse.json({ error: '试卷类型不存在' }, { status: 404 });
    }

    console.error('删除试卷类型失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description } = await request.json();
    const type = await updateExamType({ id, name, description });

    return NextResponse.json({
      success: true,
      message: `试卷类型 ${id} 的元数据已更新`,
      type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN';

    if (message === 'INVALID_PAYLOAD') {
      return NextResponse.json({ error: '试卷ID和名称是必需的' }, { status: 400 });
    }

    if (message === 'EXAM_TYPE_NOT_FOUND') {
      return NextResponse.json({ error: '试卷类型不存在' }, { status: 404 });
    }

    console.error('更新试卷类型元数据失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
