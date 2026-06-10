import { db } from '@/db';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  comfyJobs,
  comfyPromptGroups,
  comfyPrompts,
  comfyPromptSetItems,
  comfyPromptSets,
  comfyServers,
  comfyWorkflows,
} from './schema';
import type {
  ComfyJob,
  ComfyJobOutputImage,
  ComfyJobStatus,
  ComfyPrompt,
  ComfyPromptGroup,
  ComfyPromptSet,
  ComfyPromptSetItem,
  ComfyServer,
  ComfyWorkflow,
  PromptGroupFormData,
  PromptFormData,
  PromptKind,
  PromptSetFormData,
  ServerFormData,
  WorkflowFormData,
} from '../types';

class ComfyPromptDbService {
  async getGroups(userId: string): Promise<ComfyPromptGroup[]> {
    return db
      .select()
      .from(comfyPromptGroups)
      .where(eq(comfyPromptGroups.userId, userId))
      .orderBy(asc(comfyPromptGroups.order), desc(comfyPromptGroups.createdAt));
  }

  async createGroup(userId: string, data: PromptGroupFormData): Promise<ComfyPromptGroup> {
    const [maxOrder] = await db
      .select({ value: sql<number>`coalesce(max(${comfyPromptGroups.order}), 0)` })
      .from(comfyPromptGroups)
      .where(eq(comfyPromptGroups.userId, userId));

    const [row] = await db
      .insert(comfyPromptGroups)
      .values({
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || 'violet',
        kind: data.kind || 'positive',
        order: (maxOrder?.value ?? 0) + 1,
        updatedAt: new Date(),
      })
      .returning();
    return row;
  }

  async updateGroup(userId: string, id: number, data: Partial<PromptGroupFormData>): Promise<ComfyPromptGroup | null> {
    const [row] = await db
      .update(comfyPromptGroups)
      .set({
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.kind !== undefined ? { kind: data.kind } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyPromptGroups.id, id), eq(comfyPromptGroups.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteGroup(userId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(comfyPromptGroups)
      .where(and(eq(comfyPromptGroups.id, id), eq(comfyPromptGroups.userId, userId)))
      .returning({ id: comfyPromptGroups.id });
    return result.length > 0;
  }

  async getPrompts(userId: string, kind?: PromptKind): Promise<ComfyPrompt[]> {
    const conditions = [eq(comfyPrompts.userId, userId)];
    if (kind) conditions.push(eq(comfyPrompts.kind, kind));

    const rows = await db
      .select()
      .from(comfyPrompts)
      .where(and(...conditions))
      .orderBy(asc(comfyPrompts.order), desc(comfyPrompts.updatedAt));

    return rows.map(normalizePrompt);
  }

  async createPrompt(userId: string, data: PromptFormData): Promise<ComfyPrompt> {
    const [maxOrder] = await db
      .select({ value: sql<number>`coalesce(max(${comfyPrompts.order}), 0)` })
      .from(comfyPrompts)
      .where(eq(comfyPrompts.userId, userId));

    const [row] = await db
      .insert(comfyPrompts)
      .values({
        userId,
        groupId: data.groupId ?? null,
        title: data.title.trim(),
        content: data.content.trim(),
        kind: data.kind || 'positive',
        tags: data.tags ?? [],
        weight: data.weight != null ? String(data.weight) : null,
        order: (maxOrder?.value ?? 0) + 1,
        notes: data.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .returning();
    return normalizePrompt(row);
  }

  async updatePrompt(
    userId: string,
    id: number,
    data: Partial<PromptFormData>,
  ): Promise<ComfyPrompt | null> {
    const [row] = await db
      .update(comfyPrompts)
      .set({
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.content !== undefined ? { content: data.content.trim() } : {}),
        ...(data.kind !== undefined ? { kind: data.kind } : {}),
        ...(data.groupId !== undefined ? { groupId: data.groupId } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.weight !== undefined ? { weight: data.weight != null ? String(data.weight) : null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyPrompts.id, id), eq(comfyPrompts.userId, userId)))
      .returning();
    return row ? normalizePrompt(row) : null;
  }

  async deletePrompt(userId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(comfyPrompts)
      .where(and(eq(comfyPrompts.id, id), eq(comfyPrompts.userId, userId)))
      .returning({ id: comfyPrompts.id });
    return result.length > 0;
  }

  async getSets(userId: string): Promise<ComfyPromptSet[]> {
    const sets = await db
      .select()
      .from(comfyPromptSets)
      .where(eq(comfyPromptSets.userId, userId))
      .orderBy(desc(comfyPromptSets.updatedAt));

    const result: ComfyPromptSet[] = [];
    for (const set of sets) {
      result.push({
        ...set,
        tags: set.tags ?? [],
        items: await this.getSetItems(userId, set.id),
      });
    }
    return result;
  }

  async getSetById(userId: string, id: number): Promise<ComfyPromptSet | null> {
    const [set] = await db
      .select()
      .from(comfyPromptSets)
      .where(and(eq(comfyPromptSets.id, id), eq(comfyPromptSets.userId, userId)));
    if (!set) return null;
    return {
      ...set,
      tags: set.tags ?? [],
      items: await this.getSetItems(userId, set.id),
    };
  }

  async getSetItems(userId: string, setId: number): Promise<ComfyPromptSetItem[]> {
    const rows = await db
      .select({
        item: comfyPromptSetItems,
        prompt: comfyPrompts,
      })
      .from(comfyPromptSetItems)
      .innerJoin(comfyPromptSets, eq(comfyPromptSetItems.setId, comfyPromptSets.id))
      .innerJoin(comfyPrompts, eq(comfyPromptSetItems.promptId, comfyPrompts.id))
      .where(and(eq(comfyPromptSetItems.setId, setId), eq(comfyPromptSets.userId, userId)))
      .orderBy(asc(comfyPromptSetItems.order));

    return rows.map(({ item, prompt }) => ({
      ...item,
      prompt: normalizePrompt(prompt),
    }));
  }

  async createSet(userId: string, data: PromptSetFormData): Promise<ComfyPromptSet> {
    const [set] = await db
      .insert(comfyPromptSets)
      .values({
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        kind: data.kind || 'positive',
        separator: data.separator ?? ', ',
        tags: data.tags ?? [],
        updatedAt: new Date(),
      })
      .returning();

    if (data.promptIds?.length) {
      await db.insert(comfyPromptSetItems).values(
        data.promptIds.map((promptId, index) => ({
          setId: set.id,
          promptId,
          order: index,
        })),
      );
    }

    return (await this.getSetById(userId, set.id))!;
  }

  async updateSet(
    userId: string,
    id: number,
    data: Partial<PromptSetFormData>,
  ): Promise<ComfyPromptSet | null> {
    const [set] = await db
      .update(comfyPromptSets)
      .set({
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.kind !== undefined ? { kind: data.kind } : {}),
        ...(data.separator !== undefined ? { separator: data.separator } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyPromptSets.id, id), eq(comfyPromptSets.userId, userId)))
      .returning();

    if (!set) return null;

    if (data.promptIds !== undefined) {
      await db.delete(comfyPromptSetItems).where(eq(comfyPromptSetItems.setId, id));
      if (data.promptIds.length) {
        await db.insert(comfyPromptSetItems).values(
          data.promptIds.map((promptId, index) => ({
            setId: id,
            promptId,
            order: index,
          })),
        );
      }
    }

    return this.getSetById(userId, id);
  }

  async deleteSet(userId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(comfyPromptSets)
      .where(and(eq(comfyPromptSets.id, id), eq(comfyPromptSets.userId, userId)))
      .returning({ id: comfyPromptSets.id });
    return result.length > 0;
  }

  async getWorkflows(userId: string): Promise<ComfyWorkflow[]> {
    const rows = await db
      .select()
      .from(comfyWorkflows)
      .where(eq(comfyWorkflows.userId, userId))
      .orderBy(desc(comfyWorkflows.updatedAt));
    return rows.map(normalizeWorkflow);
  }

  async getWorkflowById(userId: string, id: number): Promise<ComfyWorkflow | null> {
    const [row] = await db
      .select()
      .from(comfyWorkflows)
      .where(and(eq(comfyWorkflows.id, id), eq(comfyWorkflows.userId, userId)));
    return row ? normalizeWorkflow(row) : null;
  }

  async createWorkflow(userId: string, data: WorkflowFormData): Promise<ComfyWorkflow> {
    const [row] = await db
      .insert(comfyWorkflows)
      .values({
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        workflowJson: data.workflowJson,
        positiveNodeId: data.positiveNodeId?.trim() || null,
        negativeNodeId: data.negativeNodeId?.trim() || null,
        seedNodeId: data.seedNodeId?.trim() || null,
        tags: data.tags ?? [],
        notes: data.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .returning();
    return normalizeWorkflow(row);
  }

  async updateWorkflow(
    userId: string,
    id: number,
    data: Partial<WorkflowFormData>,
  ): Promise<ComfyWorkflow | null> {
    const [row] = await db
      .update(comfyWorkflows)
      .set({
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.workflowJson !== undefined ? { workflowJson: data.workflowJson } : {}),
        ...(data.positiveNodeId !== undefined
          ? { positiveNodeId: data.positiveNodeId?.trim() || null }
          : {}),
        ...(data.negativeNodeId !== undefined
          ? { negativeNodeId: data.negativeNodeId?.trim() || null }
          : {}),
        ...(data.seedNodeId !== undefined ? { seedNodeId: data.seedNodeId?.trim() || null } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyWorkflows.id, id), eq(comfyWorkflows.userId, userId)))
      .returning();
    return row ? normalizeWorkflow(row) : null;
  }

  async deleteWorkflow(userId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(comfyWorkflows)
      .where(and(eq(comfyWorkflows.id, id), eq(comfyWorkflows.userId, userId)))
      .returning({ id: comfyWorkflows.id });
    return result.length > 0;
  }

  async getPromptsByIds(userId: string, ids: number[]): Promise<ComfyPrompt[]> {
    if (!ids.length) return [];
    const rows = await db
      .select()
      .from(comfyPrompts)
      .where(and(eq(comfyPrompts.userId, userId), inArray(comfyPrompts.id, ids)));
    const map = new Map(rows.map((row) => [row.id, normalizePrompt(row)]));
    return ids.map((id) => map.get(id)).filter(Boolean) as ComfyPrompt[];
  }

  async getServers(userId: string): Promise<ComfyServer[]> {
    return db
      .select()
      .from(comfyServers)
      .where(eq(comfyServers.userId, userId))
      .orderBy(desc(comfyServers.isDefault), desc(comfyServers.updatedAt));
  }

  async getServerById(userId: string, id: number): Promise<ComfyServer | null> {
    const [row] = await db
      .select()
      .from(comfyServers)
      .where(and(eq(comfyServers.id, id), eq(comfyServers.userId, userId)));
    return row ?? null;
  }

  async createServer(userId: string, data: ServerFormData): Promise<ComfyServer> {
    if (data.isDefault) {
      await db
        .update(comfyServers)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(comfyServers.userId, userId));
    }

    const [row] = await db
      .insert(comfyServers)
      .values({
        userId,
        name: data.name.trim(),
        baseUrl: data.baseUrl.trim(),
        isDefault: data.isDefault ?? false,
        enabled: data.enabled ?? true,
        updatedAt: new Date(),
      })
      .returning();
    return row;
  }

  async updateServer(
    userId: string,
    id: number,
    data: Partial<ServerFormData> & {
      lastCheckAt?: Date | null;
      lastCheckOk?: boolean | null;
      lastError?: string | null;
    },
  ): Promise<ComfyServer | null> {
    if (data.isDefault) {
      await db
        .update(comfyServers)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(comfyServers.userId, userId));
    }

    const [row] = await db
      .update(comfyServers)
      .set({
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.baseUrl !== undefined ? { baseUrl: data.baseUrl.trim() } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
        ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
        ...(data.lastCheckAt !== undefined ? { lastCheckAt: data.lastCheckAt } : {}),
        ...(data.lastCheckOk !== undefined ? { lastCheckOk: data.lastCheckOk } : {}),
        ...(data.lastError !== undefined ? { lastError: data.lastError } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyServers.id, id), eq(comfyServers.userId, userId)))
      .returning();
    return row ?? null;
  }

  async deleteServer(userId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(comfyServers)
      .where(and(eq(comfyServers.id, id), eq(comfyServers.userId, userId)))
      .returning({ id: comfyServers.id });
    return result.length > 0;
  }

  async getJobs(userId: string, limit = 50): Promise<ComfyJob[]> {
    const rows = await db
      .select()
      .from(comfyJobs)
      .where(eq(comfyJobs.userId, userId))
      .orderBy(desc(comfyJobs.createdAt))
      .limit(limit);
    return rows.map(normalizeJob);
  }

  async getJobById(userId: string, id: number): Promise<ComfyJob | null> {
    const [row] = await db
      .select()
      .from(comfyJobs)
      .where(and(eq(comfyJobs.id, id), eq(comfyJobs.userId, userId)));
    return row ? normalizeJob(row) : null;
  }

  async createJob(
    userId: string,
    data: {
      serverId: number;
      workflowId?: number | null;
      clientId: string;
      positivePrompt?: string;
      negativePrompt?: string;
      requestJson?: Record<string, unknown>;
    },
  ): Promise<ComfyJob> {
    const [row] = await db
      .insert(comfyJobs)
      .values({
        userId,
        serverId: data.serverId,
        workflowId: data.workflowId ?? null,
        clientId: data.clientId,
        status: 'pending',
        positivePrompt: data.positivePrompt ?? null,
        negativePrompt: data.negativePrompt ?? null,
        requestJson: data.requestJson ?? null,
        updatedAt: new Date(),
      })
      .returning();
    return normalizeJob(row);
  }

  async updateJob(
    userId: string,
    id: number,
    data: Partial<{
      promptId: string | null;
      status: ComfyJobStatus;
      responseJson: Record<string, unknown> | null;
      outputImages: ComfyJobOutputImage[];
      errorMessage: string | null;
      completedAt: Date | null;
    }>,
  ): Promise<ComfyJob | null> {
    const [row] = await db
      .update(comfyJobs)
      .set({
        ...(data.promptId !== undefined ? { promptId: data.promptId } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.responseJson !== undefined ? { responseJson: data.responseJson } : {}),
        ...(data.outputImages !== undefined ? { outputImages: data.outputImages } : {}),
        ...(data.errorMessage !== undefined ? { errorMessage: data.errorMessage } : {}),
        ...(data.completedAt !== undefined ? { completedAt: data.completedAt } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyJobs.id, id), eq(comfyJobs.userId, userId)))
      .returning();
    return row ? normalizeJob(row) : null;
  }
}

function normalizePrompt(row: typeof comfyPrompts.$inferSelect): ComfyPrompt {
  return {
    ...row,
    tags: row.tags ?? [],
  };
}

function normalizeWorkflow(row: typeof comfyWorkflows.$inferSelect): ComfyWorkflow {
  return {
    ...row,
    tags: row.tags ?? [],
  };
}

function normalizeJob(row: typeof comfyJobs.$inferSelect): ComfyJob {
  return {
    ...row,
    status: row.status as ComfyJobStatus,
    outputImages: row.outputImages ?? [],
  };
}

export const comfyPromptDbService = new ComfyPromptDbService();
