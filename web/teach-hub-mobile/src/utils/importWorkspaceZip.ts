import type { TeachHubApiClient } from '@profile/teach-hub-shared';

type ZipAsset = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
};

/** React Native FormData 上传 zip（对齐 Web importWorkspaceZip） */
export async function importWorkspaceZipFromUri(
  teachHubApi: TeachHubApiClient,
  workspaceId: string,
  asset: ZipAsset,
): Promise<{
  importedFiles: number;
  skippedFiles: number;
  warnings: string[];
  lessonCount: number;
}> {
  const filename = asset.name?.trim() || 'import.zip';
  const filePayload = {
    uri: asset.uri,
    name: filename,
    type: asset.mimeType || 'application/zip',
  };
  return teachHubApi.importWorkspaceZip(
    workspaceId,
    filePayload as unknown as Blob,
    filename,
  );
}
