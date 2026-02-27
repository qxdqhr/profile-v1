import type { ExamQueryDataSource, ExamTypeAdminRepository } from './types';

export function createExamQueryService(dataSource: ExamQueryDataSource) {
  return {
    fetchExamTypes: () => dataSource.getAllExamTypes(),
    fetchExamMetadata: (type: string) => dataSource.getExamMetadata(type),
    fetchExamQuestions: (type: string) => dataSource.getExamQuestions(type),
    fetchFullExamConfig: (type: string) => dataSource.getFullExamConfig(type),
    saveExamConfig: (type: string, config: unknown) => dataSource.saveFullExamConfig(type, config),
  };
}

export function createExamTypeAdminService(
  repository: ExamTypeAdminRepository,
  options?: { protectedExamTypes?: string[] }
) {
  const protectedTypes = new Set(options?.protectedExamTypes || ['default', 'arknights']);

  return {
    async listExamTypeIds() {
      const types = await repository.listExamTypes();
      return types.map((type) => type.id);
    },

    async listExamTypeDetails() {
      const types = await repository.listExamTypes();

      return Promise.all(
        types.map(async (type) => {
          const metadataRows = await repository.findExamMetadata(type.id);
          const metadata = metadataRows[0] || {
            id: type.id,
            name: type.id,
            description: '',
            createdAt: new Date(),
            lastModified: new Date(),
          };

          const countRows = await repository.countExamQuestions(type.id);
          const questionCount = countRows[0]?.count || 0;

          return {
            ...metadata,
            questionCount,
          };
        })
      );
    },

    async createExamType(input: { id: string; name: string; description?: string }) {
      if (!input.id || !input.name) throw new Error('INVALID_PAYLOAD');
      if (!/^[a-z0-9_-]+$/.test(input.id)) throw new Error('INVALID_ID_FORMAT');

      const existingType = await repository.findExamType(input.id);
      if (existingType.length > 0) throw new Error('EXAM_TYPE_EXISTS');

      await repository.createExamTypeWithMetadata(input);

      return {
        id: input.id,
        name: input.name,
        description: input.description || '',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
    },

    async deleteExamType(typeId: string) {
      if (!typeId) throw new Error('MISSING_TYPE_ID');
      if (protectedTypes.has(typeId)) throw new Error('PROTECTED_EXAM_TYPE');

      const existingType = await repository.findExamType(typeId);
      if (existingType.length === 0) throw new Error('EXAM_TYPE_NOT_FOUND');

      await repository.deleteExamTypeCascade(typeId);
    },

    async updateExamType(input: { id: string; name: string; description?: string }) {
      if (!input.id || !input.name) throw new Error('INVALID_PAYLOAD');

      const existingType = await repository.findExamType(input.id);
      if (existingType.length === 0) throw new Error('EXAM_TYPE_NOT_FOUND');

      await repository.updateExamTypeMetadata(input);

      return {
        id: input.id,
        name: input.name,
        description: input.description || '',
        lastModified: new Date().toISOString(),
      };
    },
  };
}
