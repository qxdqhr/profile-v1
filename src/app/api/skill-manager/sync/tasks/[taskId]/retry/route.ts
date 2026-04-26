import { NextRequest, NextResponse } from 'next/server';
import { buildTaskFromItems, executeSyncTask, readSyncStateMap, readTasks, upsertTask, writeSyncStateMap } from '../../../_lib';

export async function POST(_request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await context.params;
    const tasks = await readTasks();
    const idx = tasks.findIndex((x) => x.taskId === taskId);
    if (idx < 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    const task = tasks[idx];
    const failedSkillIds = task.items.filter((x) => x.status === 'failed').map((x) => x.skillId);
    if (!failedSkillIds.length) {
      return NextResponse.json(task);
    }

    const state = await readSyncStateMap();
    const rerun = await executeSyncTask({
      skillIds: failedSkillIds,
      strategy: task.strategy,
      prevState: state
    });
    await writeSyncStateMap(rerun.nextState);

    const mergedItems = task.items.map((item) => {
      const hit = rerun.items.find((x) => x.skillId === item.skillId);
      return hit || item;
    });

    const updatedTask = buildTaskFromItems({
      taskId: task.taskId,
      strategy: task.strategy,
      items: mergedItems,
      createdAt: task.createdAt,
      logs: [
        ...(task.logs || []),
        {
          at: new Date().toISOString(),
          level: 'info',
          message: `重试失败项：输入=${failedSkillIds.length}项`
        },
        {
          at: new Date().toISOString(),
          level: rerun.items.some((x) => x.status === 'failed') ? 'warn' : 'info',
          message: `重试结果：成功=${rerun.items.filter((x) => x.status === 'success').length} 失败=${rerun.items.filter((x) => x.status === 'failed').length}`
        }
      ]
    });
    tasks[idx] = updatedTask;
    await upsertTask(updatedTask);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[skill-manager] retry sync task failed:', error);
    return NextResponse.json({ error: '重试同步任务失败' }, { status: 500 });
  }
}

