import { createHash } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { skillManagerSyncStates, skillManagerSyncTasks } from '@/modules/skillManager/db/schema';
import { getSkillFileByRelativePath, readMeta, readTextFileById, uploadSkillFile } from '../_fileStore';

export type TaskItem = {
  id: string;
  skillId: string;
  status: 'success' | 'failed';
  reason?: string;
};

export type SyncTask = {
  taskId: string;
  mode: 'local-to-web';
  strategy: 'ff-only' | 'manual';
  status: 'running' | 'success' | 'partial' | 'failed';
  total: number;
  successCount: number;
  failedCount: number;
  createdAt: string;
  finishedAt?: string;
  items: TaskItem[];
  metrics?: {
    durationMs: number;
    successRate: number;
    conflictRate: number;
  };
  logs?: Array<{
    at: string;
    level: 'info' | 'warn' | 'error';
    message: string;
  }>;
};

type SkillSyncState = {
  baseHash: string;
  remoteHash: string;
  updatedAt: string;
};

type SyncStateMap = Record<string, SkillSyncState>;

export async function readTasks(): Promise<SyncTask[]> {
  const rows = await db
    .select()
    .from(skillManagerSyncTasks)
    .orderBy(desc(skillManagerSyncTasks.createdAt))
    .limit(200);
  return rows.map((row) => ({
    taskId: row.taskId,
    mode: row.mode as SyncTask['mode'],
    strategy: row.strategy as SyncTask['strategy'],
    status: row.status as SyncTask['status'],
    total: row.total,
    successCount: row.successCount,
    failedCount: row.failedCount,
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString(),
    items: (Array.isArray(row.items) ? row.items : []) as TaskItem[],
    metrics: (row.metrics || undefined) as SyncTask['metrics'],
    logs: (row.logs || []) as SyncTask['logs']
  }));
}

export async function writeTasks(tasks: SyncTask[]): Promise<void> {
  if (!tasks.length) return;
  for (const task of tasks) {
    await upsertTask(task);
  }
}

export async function readSyncStateMap(): Promise<SyncStateMap> {
  const rows = await db.select().from(skillManagerSyncStates);
  const result: SyncStateMap = {};
  for (const row of rows) {
    result[row.skillId] = {
      baseHash: row.baseHash,
      remoteHash: row.remoteHash,
      updatedAt: row.updatedAt.toISOString()
    };
  }
  return result;
}

export async function writeSyncStateMap(state: SyncStateMap): Promise<void> {
  const entries = Object.entries(state);
  if (!entries.length) return;
  for (const [skillId, value] of entries) {
    await db
      .insert(skillManagerSyncStates)
      .values({
        skillId,
        baseHash: value.baseHash || '',
        remoteHash: value.remoteHash || '',
        updatedAt: new Date(value.updatedAt || new Date().toISOString())
      })
      .onConflictDoUpdate({
        target: skillManagerSyncStates.skillId,
        set: {
          baseHash: value.baseHash || '',
          remoteHash: value.remoteHash || '',
          updatedAt: new Date(value.updatedAt || new Date().toISOString())
        }
      });
  }
}

export async function upsertTask(task: SyncTask): Promise<void> {
  await db
    .insert(skillManagerSyncTasks)
    .values({
      taskId: task.taskId,
      mode: task.mode,
      strategy: task.strategy,
      status: task.status,
      total: task.total,
      successCount: task.successCount,
      failedCount: task.failedCount,
      createdAt: new Date(task.createdAt),
      finishedAt: task.finishedAt ? new Date(task.finishedAt) : null,
      items: task.items,
      metrics: task.metrics || null,
      logs: task.logs || []
    })
    .onConflictDoUpdate({
      target: skillManagerSyncTasks.taskId,
      set: {
        status: task.status,
        total: task.total,
        successCount: task.successCount,
        failedCount: task.failedCount,
        finishedAt: task.finishedAt ? new Date(task.finishedAt) : null,
        items: task.items,
        metrics: task.metrics || null,
        logs: task.logs || []
      }
    });
}

async function getSkillMarkdownHash(skillId: string): Promise<string | null> {
  try {
    const file = await getSkillFileByRelativePath(skillId, 'SKILL.md');
    if (!file) return null;
    const content = await readTextFileById(file.id);
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return null;
  }
}

export async function getCurrentSkillMarkdownHash(skillId: string): Promise<string | null> {
  return getSkillMarkdownHash(skillId);
}

export async function saveSkillMarkdownBySyncDecision(skillId: string, content: string): Promise<string | null> {
  const existing = await getSkillFileByRelativePath(skillId, 'SKILL.md');
  const prevMeta = existing
    ? readMeta(existing)
    : {
        source: 'manual_upload' as const,
        status: 'draft' as const
      };
  await uploadSkillFile({
    skillId,
    relativePath: 'SKILL.md',
    content,
    source: prevMeta.source,
    status: prevMeta.status,
    uploaderId: 'sync-task'
  });
  return createHash('sha256').update(content).digest('hex');
}

export async function getSkillSyncState(skillId: string): Promise<SkillSyncState | null> {
  const rows = await db.select().from(skillManagerSyncStates).where(eq(skillManagerSyncStates.skillId, skillId)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    baseHash: row.baseHash || '',
    remoteHash: row.remoteHash || '',
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function setSkillSyncState(skillId: string, state: SkillSyncState): Promise<void> {
  await db
    .insert(skillManagerSyncStates)
    .values({
      skillId,
      baseHash: state.baseHash || '',
      remoteHash: state.remoteHash || '',
      updatedAt: new Date(state.updatedAt || new Date().toISOString())
    })
    .onConflictDoUpdate({
      target: skillManagerSyncStates.skillId,
      set: {
        baseHash: state.baseHash || '',
        remoteHash: state.remoteHash || '',
        updatedAt: new Date(state.updatedAt || new Date().toISOString())
      }
    });
}

type EvaluateResult = {
  ok: boolean;
  reason?: string;
  nextState?: SkillSyncState;
};

function evaluateByStrategy(input: {
  strategy: 'ff-only' | 'manual';
  skillId: string;
  localHash: string;
  baseHash: string;
  remoteHash: string;
}): EvaluateResult {
  const { strategy, localHash, baseHash, remoteHash } = input;
  const now = new Date().toISOString();

  // 初始化：没有远端状态，允许首同步
  if (!baseHash && !remoteHash) {
    return {
      ok: true,
      nextState: { baseHash: localHash, remoteHash: localHash, updatedAt: now }
    };
  }

  if (localHash === remoteHash) {
    return {
      ok: true,
      reason: 'No-op: local 与 remote 一致',
      nextState: { baseHash, remoteHash, updatedAt: now }
    };
  }

  if (baseHash === remoteHash && localHash !== remoteHash) {
    return {
      ok: true,
      reason: 'Fast-forward: local 领先',
      nextState: { baseHash: localHash, remoteHash: localHash, updatedAt: now }
    };
  }

  if (baseHash === localHash && remoteHash !== localHash) {
    return {
      ok: false,
      reason:
        strategy === 'manual'
          ? 'Behind: remote 领先，需手工决策（选择本地/远端/合并）'
          : 'Behind: remote 领先，ff-only 策略拒绝同步'
    };
  }

  return {
    ok: false,
    reason:
      strategy === 'manual'
        ? 'Diverged: local 与 remote 分叉，需手工决策（选择本地/远端/合并）'
        : 'Diverged: local 与 remote 分叉，ff-only 策略拒绝同步'
  };
}

export async function executeSyncTask(input: {
  skillIds: string[];
  strategy: 'ff-only' | 'manual';
  prevState?: SyncStateMap;
}): Promise<{ items: TaskItem[]; nextState: SyncStateMap }> {
  const state = input.prevState ? { ...input.prevState } : await readSyncStateMap();
  const items: TaskItem[] = [];

  for (const skillId of input.skillIds) {
    const localHash = await getSkillMarkdownHash(skillId);
    if (!localHash) {
      items.push({
        id: `${skillId}-${Date.now()}`,
        skillId,
        status: 'failed',
        reason: 'SKILL.md 不存在或不可读取'
      });
      continue;
    }

    const current = state[skillId] || { baseHash: '', remoteHash: '', updatedAt: '' };
    const evaluated = evaluateByStrategy({
      strategy: input.strategy,
      skillId,
      localHash,
      baseHash: current.baseHash,
      remoteHash: current.remoteHash
    });

    if (evaluated.ok) {
      if (evaluated.nextState) {
        state[skillId] = evaluated.nextState;
      }
      items.push({
        id: `${skillId}-${Date.now()}`,
        skillId,
        status: 'success',
        reason: evaluated.reason
      });
    } else {
      items.push({
        id: `${skillId}-${Date.now()}`,
        skillId,
        status: 'failed',
        reason: evaluated.reason || '同步失败'
      });
    }
  }

  return { items, nextState: state };
}

export function buildTaskFromItems(input: {
  taskId: string;
  strategy: 'ff-only' | 'manual';
  items: TaskItem[];
  createdAt?: string;
  logs?: Array<{
    at: string;
    level: 'info' | 'warn' | 'error';
    message: string;
  }>;
}): SyncTask {
  const successCount = input.items.filter((x) => x.status === 'success').length;
  const failedCount = input.items.length - successCount;
  const status: SyncTask['status'] = failedCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed';
  const now = new Date().toISOString();
  const createdAt = input.createdAt || now;
  const durationMs = Math.max(0, new Date(now).getTime() - new Date(createdAt).getTime());
  const total = input.items.length;
  const successRate = total ? Number((successCount / total).toFixed(4)) : 0;
  const conflictRate = total ? Number((failedCount / total).toFixed(4)) : 0;
  return {
    taskId: input.taskId,
    mode: 'local-to-web',
    strategy: input.strategy,
    status,
    total,
    successCount,
    failedCount,
    createdAt,
    finishedAt: now,
    items: input.items,
    metrics: {
      durationMs,
      successRate,
      conflictRate
    },
    logs: input.logs || []
  };
}

