import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { buildTaskFromItems, getSkillsRootDir, readSyncStateMap, readTasks, writeSyncStateMap, writeTasks } from '../../../_lib';

type ResolutionDecision = 'local' | 'remote' | 'merge_edit';

async function getLocalSkillHash(skillId: string): Promise<string | null> {
  try {
    const filePath = path.join(getSkillsRootDir(), skillId, 'SKILL.md');
    const content = await fs.readFile(filePath, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return null;
  }
}

async function writeLocalSkillContent(skillId: string, content: string): Promise<string> {
  const filePath = path.join(getSkillsRootDir(), skillId, 'SKILL.md');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

export async function POST(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await context.params;
    const body = (await request.json()) as {
      resolutions?: Array<{ skillId?: string; decision?: ResolutionDecision; mergedContent?: string }>;
    };
    const resolutions = Array.isArray(body.resolutions) ? body.resolutions : [];
    if (!resolutions.length) {
      return NextResponse.json({ error: 'resolutions 不能为空' }, { status: 400 });
    }

    const tasks = await readTasks();
    const idx = tasks.findIndex((x) => x.taskId === taskId);
    if (idx < 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }
    const task = tasks[idx];
    if (task.strategy !== 'manual') {
      return NextResponse.json({ error: '仅 manual 策略支持冲突手工处理' }, { status: 400 });
    }

    const state = await readSyncStateMap();
    const resolutionMap = new Map<string, { decision: ResolutionDecision; mergedContent?: string }>();
    for (const item of resolutions) {
      if (!item.skillId || !item.decision) continue;
      resolutionMap.set(item.skillId, {
        decision: item.decision,
        mergedContent: item.mergedContent
      });
    }

    const nextItems = [...task.items];
    for (let i = 0; i < nextItems.length; i += 1) {
      const item = nextItems[i];
      if (item.status !== 'failed') continue;
      const resolution = resolutionMap.get(item.skillId);
      if (!resolution) continue;
      const { decision, mergedContent } = resolution;

      if (decision === 'merge_edit') {
        const merged = (mergedContent || '').trim();
        if (!merged) {
          nextItems[i] = {
            ...item,
            status: 'failed',
            reason: 'merge_edit 需要填写合并后的 SKILL.md 内容'
          };
          continue;
        }
        const mergedHash = await writeLocalSkillContent(item.skillId, merged);
        state[item.skillId] = {
          baseHash: mergedHash,
          remoteHash: mergedHash,
          updatedAt: new Date().toISOString()
        };
        nextItems[i] = {
          ...item,
          status: 'success',
          reason: 'manual 决策已应用：merge_edit 内容已写入并同步'
        };
        continue;
      }

      if (decision === 'local') {
        const localHash = await getLocalSkillHash(item.skillId);
        if (!localHash) {
          nextItems[i] = {
            ...item,
            status: 'failed',
            reason: '本地 SKILL.md 不存在，无法应用 local 决策'
          };
          continue;
        }
        state[item.skillId] = {
          baseHash: localHash,
          remoteHash: localHash,
          updatedAt: new Date().toISOString()
        };
        nextItems[i] = {
          ...item,
          status: 'success',
          reason: 'manual 决策已应用：使用本地版本覆盖远端状态'
        };
        continue;
      }

      if (decision === 'remote') {
        const prev = state[item.skillId];
        if (!prev?.remoteHash) {
          nextItems[i] = {
            ...item,
            status: 'failed',
            reason: '缺少远端快照，无法应用 remote 决策'
          };
          continue;
        }
        state[item.skillId] = {
          baseHash: prev.remoteHash,
          remoteHash: prev.remoteHash,
          updatedAt: new Date().toISOString()
        };
        nextItems[i] = {
          ...item,
          status: 'success',
          reason: 'manual 决策已应用：采用远端版本'
        };
      }
    }

    await writeSyncStateMap(state);
    const updatedTask = buildTaskFromItems({
      taskId: task.taskId,
      strategy: task.strategy,
      items: nextItems,
      createdAt: task.createdAt,
      logs: [
        ...(task.logs || []),
        {
          at: new Date().toISOString(),
          level: 'info',
          message: `应用手工冲突决策：输入=${resolutions.length}项`
        },
        {
          at: new Date().toISOString(),
          level: nextItems.some((x) => x.status === 'failed') ? 'warn' : 'info',
          message: `决策后状态：成功=${nextItems.filter((x) => x.status === 'success').length} 失败=${nextItems.filter((x) => x.status === 'failed').length}`
        }
      ]
    });
    tasks[idx] = updatedTask;
    await writeTasks(tasks);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[skill-manager] resolve sync task failed:', error);
    return NextResponse.json({ error: '冲突处理失败' }, { status: 500 });
  }
}

