import {
  countExamQuestions,
  createExamTypeWithMetadata,
  deleteExamTypeCascade,
  findExamMetadata,
  findExamType,
  listExamTypes,
  updateExamTypeMetadata,
} from './examRepository';

const PROTECTED_EXAM_TYPES = new Set(['default', 'arknights']);

export async function listExamTypeIds() {
  const types = await listExamTypes();
  return types.map((type) => type.id);
}

export async function listExamTypeDetails() {
  const types = await listExamTypes();

  return Promise.all(
    types.map(async (type) => {
      const metadataRows = await findExamMetadata(type.id);
      const metadata = metadataRows[0] || {
        id: type.id,
        name: type.id,
        description: '',
        createdAt: new Date(),
        lastModified: new Date(),
      };

      const countRows = await countExamQuestions(type.id);
      const questionCount = countRows[0]?.count || 0;

      return {
        ...metadata,
        questionCount,
      };
    })
  );
}

export async function createExamType(input: { id: string; name: string; description?: string }) {
  if (!input.id || !input.name) {
    throw new Error('INVALID_PAYLOAD');
  }

  if (!/^[a-z0-9_-]+$/.test(input.id)) {
    throw new Error('INVALID_ID_FORMAT');
  }

  const existingType = await findExamType(input.id);
  if (existingType.length > 0) {
    throw new Error('EXAM_TYPE_EXISTS');
  }

  await createExamTypeWithMetadata(input);

  return {
    id: input.id,
    name: input.name,
    description: input.description || '',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
}

export async function deleteExamType(typeId: string) {
  if (!typeId) {
    throw new Error('MISSING_TYPE_ID');
  }

  if (PROTECTED_EXAM_TYPES.has(typeId)) {
    throw new Error('PROTECTED_EXAM_TYPE');
  }

  const existingType = await findExamType(typeId);
  if (existingType.length === 0) {
    throw new Error('EXAM_TYPE_NOT_FOUND');
  }

  await deleteExamTypeCascade(typeId);
}

export async function updateExamType(input: { id: string; name: string; description?: string }) {
  if (!input.id || !input.name) {
    throw new Error('INVALID_PAYLOAD');
  }

  const existingType = await findExamType(input.id);
  if (existingType.length === 0) {
    throw new Error('EXAM_TYPE_NOT_FOUND');
  }

  await updateExamTypeMetadata(input);

  return {
    id: input.id,
    name: input.name,
    description: input.description || '',
    lastModified: new Date().toISOString(),
  };
}
