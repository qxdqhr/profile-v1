import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { buildTaskFromItems, executeSyncTask, readSyncStateMap, readTasks, writeSyncStateMap, writeTasks } from '../_lib';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      skillIds?: string[];
      mode?: 'local-to-web';
      strategy?: 'ff-only' | 'manual';
    };
    const skillIds = Array.isArray(body.skillIds) ? body.skillIds.filter((x) => typeof x === 'string' && x.trim()) : [];
    if (!skillIds.length) {
      return NextResponse.json({ error: 'skillIds 不能为空' }, { status: 400 });
    }
    const mode: 'local-to-web' = 'local-to-web';
    const strategy: 'ff-only' | 'manual' = body.strategy === 'manual' ? 'manual' : 'ff-only';
    const state = await readSyncStateMap();
    const executed = await executeSyncTask({
      skillIds,
      strategy,
      prevState: state
    });
    await writeSyncStateMap(executed.nextState);
    const task = buildTaskFromItems({
      taskId: randomUUID(),
      strategy,
      items: executed.items,
      logs: [
        {
          at: new Date().toISOString(),
          level: 'info',
          message: `创建同步任务，策略=${strategy}，输入=${skillIds.length}项`
        },
        {
          at: new Date().toISOString(),
          level: executed.items.some((x) => x.status === 'failed') ? 'warn' : 'info',
          message: `执行完成：成功=${executed.items.filter((x) => x.status === 'success').length} 失败=${executed.items.filter((x) => x.status === 'failed').length}`
        }
      ]
    });
    const tasks = await readTasks();
    tasks.unshift(task);
    await writeTasks(tasks.slice(0, 200));
    return NextResponse.json(task);
  } catch (error) {
    console.error('[skill-manager] create sync task failed:', error);
    return NextResponse.json({ error: '创建同步任务失败' }, { status: 500 });
  }
}

