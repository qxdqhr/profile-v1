/**
 * 画集作品迁移 — 包装 sa2kit migration（若当前版本已构建）
 */
async function main() {
  try {
    const mod = await import('sa2kit/showmasterpiece/migration');
    if (typeof mod.runArtworkMigration === 'function') {
      await mod.runArtworkMigration(process.argv.slice(2));
      return;
    }
    console.error('sa2kit/showmasterpiece/migration 未导出 runArtworkMigration');
    process.exit(1);
  } catch (e) {
    console.error(
      '无法加载 sa2kit/showmasterpiece/migration。请升级 sa2kit 或在 sa2kit 源码仓执行迁移。',
    );
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
