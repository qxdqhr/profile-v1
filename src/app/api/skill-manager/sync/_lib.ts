import path from 'path';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';

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

export function getSkillsRootDir(): string {
  const customDir = process.env.SKILL_MANAGER_LOCAL_DIR;
  if (customDir?.trim()) return customDir;
  const home = process.env.HOME || process.cwd();
  return path.join(home, '.cursor', 'skills');
}

export function getTasksFilePath(): string {
  const home = process.env.HOME || process.cwd();
  return path.join(home, '.cursor', 'skill-manager-sync-tasks.json');
}

export function getStateFilePath(): string {
  const home = process.env.HOME || process.cwd();
  return path.join(home, '.cursor', 'skill-manager-sync-state.json');
}

export async function readTasks(): Promise<SyncTask[]> {
  try {
    const file = await fs.readFile(getTasksFilePath(), 'utf-8');
    const parsed = JSON.parse(file) as SyncTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeTasks(tasks: SyncTask[]): Promise<void> {
  const target = getTasksFilePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(tasks, null, 2)}\n`, 'utf-8');
}

export async function readSyncStateMap(): Promise<SyncStateMap> {
  try {
    const file = await fs.readFile(getStateFilePath(), 'utf-8');
    const parsed = JSON.parse(file) as SyncStateMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function writeSyncStateMap(state: SyncStateMap): Promise<void> {
  const target = getStateFilePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
}

async function getLocalSkillHash(skillId: string): Promise<string | null> {
  try {
    const filePath = path.join(getSkillsRootDir(), skillId, 'SKILL.md');
    const content = await fs.readFile(filePath, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return null;
  }
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
    const localHash = await getLocalSkillHash(skillId);
    if (!localHash) {
      items.push({
        id: `${skillId}-${Date.now()}`,
        skillId,
        status: 'failed',
        reason: '本地 SKILL.md 不存在或不可读取'
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

