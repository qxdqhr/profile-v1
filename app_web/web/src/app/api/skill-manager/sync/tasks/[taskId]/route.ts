import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { readTasks } from '../../_lib';

export async function GET(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { taskId } = await context.params;
    const tasks = await readTasks();
    const task = tasks.find((x) => x.taskId === taskId);
    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error('[skill-manager] get sync task failed:', error);
    return NextResponse.json({ error: '查询同步任务失败' }, { status: 500 });
  }
}
