export {
  DEFAULT_MISSION_TEMPLATE,
  composeMissionMarkdown,
} from '@profile/teach-hub-shared/templates/mission';

export { DEFAULT_RESOURCES_MD } from '@profile/teach-hub-shared/parsers/resourcesParser';

export const DEFAULT_NOTES_MD = `# 教学笔记

## 学习偏好

- 

`;

export function buildWorkspaceMeta(input: {
  title: string;
  topic?: string | null;
  forkedFrom?: string | null;
  autoSyncLessonResources?: boolean;
}) {
  return {
    version: 1,
    title: input.title,
    topic: input.topic ?? null,
    language: 'zh-CN',
    createdAt: new Date().toISOString(),
    forkedFrom: input.forkedFrom ?? null,
    autoSyncLessonResources: input.autoSyncLessonResources ?? false,
  };
}
