/**
 * OSS 迁移 — 包装 sa2kit migration（若当前版本已构建）
 */
async function main() {
  try {
    const mod = await import('sa2kit/showmasterpiece/migration');
    if (typeof mod.runArtworkMigration === 'function') {
      await mod.runArtworkMigration(process.argv.slice(2));
      return;
    }
    console.error('当前 sa2kit 版本无 OSS 迁移入口，请在 sa2kit 仓查看迁移文档。');
    process.exit(1);
  } catch (e) {
    console.error('无法加载 sa2kit/showmasterpiece/migration:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
