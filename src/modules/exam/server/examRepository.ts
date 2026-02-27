import { db } from '@/db';
import {
  examMetadata,
  examQuestions,
  examResultModals,
  examStartScreens,
  examTypes,
} from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export async function listExamTypes() {
  return db.select().from(examTypes);
}

export async function findExamType(typeId: string) {
  return db.select().from(examTypes).where(eq(examTypes.id, typeId));
}

export async function findExamMetadata(typeId: string) {
  return db.select().from(examMetadata).where(eq(examMetadata.id, typeId));
}

export async function countExamQuestions(typeId: string) {
  return db
    .select({ count: sql<number>`count(*)` })
    .from(examQuestions)
    .where(eq(examQuestions.examTypeId, typeId));
}

export async function createExamTypeWithMetadata(input: {
  id: string;
  name: string;
  description?: string;
}) {
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(examTypes).values({
      id: input.id,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(examMetadata).values({
      id: input.id,
      name: input.name,
      description: input.description || '',
      createdAt: now,
      lastModified: now,
    });
  });
}

export async function updateExamTypeMetadata(input: {
  id: string;
  name: string;
  description?: string;
}) {
  await db
    .update(examMetadata)
    .set({
      name: input.name,
      description: input.description || '',
      lastModified: new Date(),
    })
    .where(eq(examMetadata.id, input.id));
}

export async function deleteExamTypeCascade(typeId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(examQuestions).where(eq(examQuestions.examTypeId, typeId));
    await tx.delete(examStartScreens).where(eq(examStartScreens.id, typeId));
    await tx.delete(examResultModals).where(eq(examResultModals.id, typeId));
    await tx.delete(examMetadata).where(eq(examMetadata.id, typeId));
    await tx.delete(examTypes).where(eq(examTypes.id, typeId));
  });
}
