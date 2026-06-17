import {
  getWorkspaceForUser,
  listWorkspaceFiles,
  putWorkspaceFileText,
  readWorkspaceFileText,
  repairWorkspaceSeedFilesIfMissing,
} from '@profile/teach-hub-core/server';

async function main() {
  const userId = process.argv[2] || 'YRMAoATU4uNCjkIaxCQQI';
  const workspaceId = process.argv[3] || '3ab9c781-bfb9-4f7c-bc5e-5f23e132680e';

  console.log('userId', userId, 'workspaceId', workspaceId);

  const workspace = await getWorkspaceForUser(userId, workspaceId);
  if (!workspace) {
    throw new Error('workspace not found');
  }

  const repaired = await repairWorkspaceSeedFilesIfMissing(userId, workspace);
  console.log('repaired seed files:', repaired);

  const before = await listWorkspaceFiles(userId, workspaceId);
  console.log('files:', before.map((f) => f.relativePath));

  if (!before.some((f) => f.relativePath === 'MISSION.md')) {
    await putWorkspaceFileText({
      userId,
      workspaceId,
      relativePath: 'MISSION.md',
      content: '# Mission\n\n## Why\n测试持久化写入\n',
    });
  }

  const after = await listWorkspaceFiles(userId, workspaceId);
  console.log('files after write:', after.map((f) => f.relativePath));

  const text = await readWorkspaceFileText(userId, workspaceId, 'MISSION.md');
  console.log('MISSION preview:', text.slice(0, 120));
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
