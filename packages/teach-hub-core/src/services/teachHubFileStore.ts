import AdmZip from 'adm-zip';
import {
  uploadFileAndResolveAccessUrl,
  FileDbService,
} from 'sa2kit/common/file/server';
import { createTeachHubPersistentFileService } from '../integrations/ossFile';
import { db } from '@profile/db';
import type { LessonIndex, TeachStoredFile } from '../types';
import {
  formatTeachHubStorageError,
  getTeachHubLocalFileService,
  isOssUploadError,
} from '../utils/storageFallback';
import { persistTeachHubUploadMetadata } from '../utils/teachHubFilePersistence';
import {
  TEACH_HUB_MODULE_ID,
  buildBusinessId,
  buildCustomPath,
  sanitizeRelativePath,
} from '../utils/teachWorkspacePaths';
import { listLessonsFromPaths } from '../utils/lessonIndex';
import { shouldSkipZipEntry, validateWorkspacePaths } from '../utils/workspaceValidator';
import type { TeachWorkspace } from '../types';
import {
  buildWorkspaceMeta,
  composeMissionMarkdown,
  DEFAULT_NOTES_MD,
  DEFAULT_RESOURCES_MD,
} from '../utils/workspaceTemplates';

type RawFile = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  moduleId: string;
  businessId: string;
  cdnUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | Date | null;
};

export type ImportWorkspaceZipResult = {
  importedFiles: number;
  skippedFiles: number;
  validation: ReturnType<typeof validateWorkspacePaths>;
  paths: string[];
};

function toIso(value: string | Date | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

function deriveRelativePath(file: RawFile): string {
  const fromMeta =
    typeof file.metadata?.relativePath === 'string' ? file.metadata.relativePath.trim() : '';
  if (fromMeta) return fromMeta;
  const prefix = `${TEACH_HUB_MODULE_ID}/`;
  const marker = `${file.businessId}/`;
  const idx = file.storagePath?.indexOf(marker);
  if (idx != null && idx >= 0 && file.storagePath) {
    return file.storagePath.slice(idx + marker.length);
  }
  return file.originalName;
}

function detectMimeType(relativePath: string): string {
  if (relativePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (relativePath.endsWith('.md')) return 'text/markdown; charset=utf-8';
  if (relativePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

async function createFileDbService(): Promise<FileDbService> {
  return new FileDbService(db);
}

async function createFileService() {
  return createTeachHubPersistentFileService();
}

async function readFileBufferById(fileId: string, userId?: string): Promise<Buffer> {
  const fileService = await createFileService();
  return fileService.downloadFile(fileId, userId);
}

async function uploadAndPersistFile(
  fileService: Awaited<ReturnType<typeof createFileService>>,
  uploadPayload: Parameters<typeof uploadFileAndResolveAccessUrl>[1],
  uploaderId: string,
): Promise<{ fileId: string; accessUrl: string }> {
  const { fileId, accessUrl, uploadResult } = await uploadFileAndResolveAccessUrl(
    fileService,
    uploadPayload,
    uploaderId,
  );
  await persistTeachHubUploadMetadata(uploadResult, uploaderId);
  return { fileId, accessUrl };
}

function mapRawFile(raw: RawFile): TeachStoredFile {
  return {
    id: raw.id,
    relativePath: deriveRelativePath(raw),
    mimeType: raw.mimeType,
    size: raw.size,
    createdAt: toIso(raw.createdAt),
  };
}

export async function listWorkspaceFiles(
  userId: string,
  workspaceId: string,
): Promise<TeachStoredFile[]> {
  const businessId = buildBusinessId(userId, workspaceId);
  const fileDbService = await createFileDbService();
  const result = await fileDbService.getFiles({
    moduleId: TEACH_HUB_MODULE_ID,
    businessId,
    isDeleted: false,
    limit: 2000,
    offset: 0,
  });
  const files = (result?.files || []) as RawFile[];
  const latestByPath = new Map<string, TeachStoredFile>();

  for (const raw of files) {
    const item = mapRawFile(raw);
    const prev = latestByPath.get(item.relativePath);
    if (!prev || prev.createdAt < item.createdAt) {
      latestByPath.set(item.relativePath, item);
    }
  }

  return Array.from(latestByPath.values()).sort((a, b) =>
    a.relativePath < b.relativePath ? -1 : 1,
  );
}

export async function getWorkspaceFileByPath(
  userId: string,
  workspaceId: string,
  relativePath: string,
): Promise<TeachStoredFile | null> {
  const safePath = sanitizeRelativePath(relativePath);
  if (!safePath) return null;
  const files = await listWorkspaceFiles(userId, workspaceId);
  return files.find((f) => f.relativePath === safePath) || null;
}

export async function readWorkspaceFileText(
  userId: string,
  workspaceId: string,
  relativePath: string,
): Promise<string> {
  const file = await getWorkspaceFileByPath(userId, workspaceId, relativePath);
  if (!file) {
    throw new Error(`文件不存在: ${relativePath}`);
  }
  const buffer = await readFileBufferById(file.id, userId);
  return buffer.toString('utf8');
}

export async function putWorkspaceFileText(input: {
  userId: string;
  workspaceId: string;
  relativePath: string;
  content: string;
  uploaderId?: string;
}): Promise<{ fileId: string; accessUrl: string }> {
  const safePath = sanitizeRelativePath(input.relativePath);
  if (!safePath) {
    throw new Error(`非法 relativePath: ${input.relativePath}`);
  }

  const name = safePath.split('/').pop() || 'file.txt';
  const mime = detectMimeType(safePath);
  const file = new File([input.content], name, { type: mime.split(';')[0] });
  const uploadPayload = {
    file,
    moduleId: TEACH_HUB_MODULE_ID,
    businessId: buildBusinessId(input.userId, input.workspaceId),
    customPath: buildCustomPath(input.userId, input.workspaceId, safePath),
    metadata: {
      relativePath: safePath,
      uploadedBy: input.uploaderId || input.userId,
      uploadedAt: new Date().toISOString(),
    },
  };
  const uploader = input.uploaderId || input.userId;

  try {
    const fileService = await createFileService();
    return await uploadAndPersistFile(fileService, uploadPayload, uploader);
  } catch (primaryError) {
    if (!isOssUploadError(primaryError)) {
      throw primaryError;
    }
    try {
      const localService = await getTeachHubLocalFileService();
      return await uploadAndPersistFile(localService, uploadPayload, uploader);
    } catch (fallbackError) {
      throw new Error(formatTeachHubStorageError(fallbackError));
    }
  }
}

export async function listWorkspaceLessons(
  userId: string,
  workspaceId: string,
): Promise<LessonIndex[]> {
  const files = await listWorkspaceFiles(userId, workspaceId);
  const paths = files.map((f) => f.relativePath);
  return listLessonsFromPaths(paths);
}

export async function importWorkspaceZip(input: {
  userId: string;
  workspaceId: string;
  zipBuffer: Buffer;
  uploaderId?: string;
  stripRootFolder?: boolean;
}): Promise<ImportWorkspaceZipResult> {
  const zip = new AdmZip(input.zipBuffer);
  const entries = zip.getEntries();
  const importedPaths: string[] = [];
  let importedFiles = 0;
  let skippedFiles = 0;

  let commonRoot: string | null = null;
  if (input.stripRootFolder !== false) {
    const fileEntries = entries.filter((e) => !e.isDirectory && !shouldSkipZipEntry(e.entryName));
    if (fileEntries.length > 0) {
      const firstSegment = fileEntries[0].entryName.replaceAll('\\', '/').split('/')[0];
      const allShareRoot = fileEntries.every((e) =>
        e.entryName.replaceAll('\\', '/').startsWith(`${firstSegment}/`),
      );
      if (allShareRoot && firstSegment && !firstSegment.includes('.')) {
        commonRoot = firstSegment;
      }
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    let relativePath = entry.entryName.replaceAll('\\', '/');
    if (shouldSkipZipEntry(relativePath)) {
      skippedFiles += 1;
      continue;
    }
    if (commonRoot && relativePath.startsWith(`${commonRoot}/`)) {
      relativePath = relativePath.slice(commonRoot.length + 1);
    }
    const safePath = sanitizeRelativePath(relativePath);
    if (!safePath) {
      skippedFiles += 1;
      continue;
    }

    const content = entry.getData().toString('utf8');
    await putWorkspaceFileText({
      userId: input.userId,
      workspaceId: input.workspaceId,
      relativePath: safePath,
      content,
      uploaderId: input.uploaderId,
    });
    importedPaths.push(safePath);
    importedFiles += 1;
  }

  const validation = validateWorkspacePaths(importedPaths);
  return {
    importedFiles,
    skippedFiles,
    validation,
    paths: importedPaths,
  };
}

export async function buildWorkspaceZip(
  userId: string,
  workspaceId: string,
): Promise<Buffer> {
  const files = await listWorkspaceFiles(userId, workspaceId);
  const zip = new AdmZip();
  for (const file of files) {
    try {
      const bytes = await readFileBufferById(file.id, userId);
      zip.addFile(file.relativePath, bytes);
    } catch {
      // skip unreadable files
    }
  }
  return zip.toBuffer();
}

const DEFAULT_MISSION_PLACEHOLDER = '（请填写你学习这个主题的原因）';

/** 修复早期未写入 file_metadata 的工作区，补全 MISSION 等种子文件 */
export async function repairWorkspaceSeedFilesIfMissing(
  userId: string,
  workspace: Pick<TeachWorkspace, 'id' | 'title' | 'topic' | 'missionSummary'>,
): Promise<boolean> {
  const files = await listWorkspaceFiles(userId, workspace.id);
  if (files.some((f) => f.relativePath === 'MISSION.md')) {
    return false;
  }

  const summary = workspace.missionSummary?.trim() || '';
  await initEmptyWorkspaceFiles({
    userId,
    workspaceId: workspace.id,
    title: workspace.title,
    topic: workspace.topic ?? null,
    missionMarkdown: composeMissionMarkdown({
      why: summary && summary !== DEFAULT_MISSION_PLACEHOLDER ? summary : '',
    }),
    resourcesMarkdown: DEFAULT_RESOURCES_MD,
    notesMarkdown: DEFAULT_NOTES_MD,
    metaJson: buildWorkspaceMeta({
      title: workspace.title,
      topic: workspace.topic ?? null,
    }),
  });
  return true;
}

export async function initEmptyWorkspaceFiles(input: {
  userId: string;
  workspaceId: string;
  title: string;
  topic?: string | null;
  missionMarkdown: string;
  resourcesMarkdown: string;
  notesMarkdown: string;
  metaJson: Record<string, unknown>;
}): Promise<void> {
  const base = {
    userId: input.userId,
    workspaceId: input.workspaceId,
    uploaderId: input.userId,
  };
  await putWorkspaceFileText({
    ...base,
    relativePath: 'MISSION.md',
    content: input.missionMarkdown,
  });
  await putWorkspaceFileText({
    ...base,
    relativePath: 'RESOURCES.md',
    content: input.resourcesMarkdown,
  });
  await putWorkspaceFileText({
    ...base,
    relativePath: 'NOTES.md',
    content: input.notesMarkdown,
  });
  await putWorkspaceFileText({
    ...base,
    relativePath: '.meta.json',
    content: JSON.stringify(input.metaJson, null, 2),
  });
}
