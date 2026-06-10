import { db } from '@/db';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  comfyPromptGroups,
  comfyPrompts,
  comfyPromptSetItems,
  comfyPromptSets,
  comfyWorkflows,
} from './schema';
import type {
  ComfyPrompt,
  ComfyPromptGroup,
  ComfyPromptSet,
  ComfyPromptSetItem,
  ComfyWorkflow,
  PromptGroupFormData,
  PromptFormData,
  PromptKind,
  PromptSetFormData,
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
    return rows.map((row) => ({ ...row, tags: row.tags ?? [] }));
  }

  async getWorkflowById(userId: string, id: number): Promise<ComfyWorkflow | null> {
    const [row] = await db
      .select()
      .from(comfyWorkflows)
      .where(and(eq(comfyWorkflows.id, id), eq(comfyWorkflows.userId, userId)));
    return row ? { ...row, tags: row.tags ?? [] } : null;
  }

  async createWorkflow(userId: string, data: WorkflowFormData): Promise<ComfyWorkflow> {
    const [row] = await db
      .insert(comfyWorkflows)
      .values({
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        workflowJson: data.workflowJson,
        tags: data.tags ?? [],
        notes: data.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .returning();
    return { ...row, tags: row.tags ?? [] };
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
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(comfyWorkflows.id, id), eq(comfyWorkflows.userId, userId)))
      .returning();
    return row ? { ...row, tags: row.tags ?? [] } : null;
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
}

function normalizePrompt(row: typeof comfyPrompts.$inferSelect): ComfyPrompt {
  return {
    ...row,
    tags: row.tags ?? [],
  };
}

export const comfyPromptDbService = new ComfyPromptDbService();
