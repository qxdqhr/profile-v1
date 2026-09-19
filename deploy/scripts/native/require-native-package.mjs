#!/usr/bin/env node
/**
 * 根脚本跑 native 包前检查：submodule 已检出且已进 workspace。
 * 用法：node deploy/scripts/native/require-native-package.mjs @profile/calendar-mobile
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const pkgName = process.argv[2];
if (!pkgName) {
  console.error('usage: node deploy/scripts/native/require-native-package.mjs <package-name>');
  process.exit(1);
}

const root = join(import.meta.dirname, '../../..');
const workspace = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8');
const nativeEnabled = [
  "  - 'app_mobile/calendar-mobile'",
  "  - 'app_mobile/teach-hub-mobile'",
  "  - 'app_desktop/teach-hub-desktop'",
  "  - 'app_desktop/lan-drop'",
].every((line) => workspace.includes(`\n${line}\n`));

const dirByName = {
  '@profile/calendar-mobile': 'app_mobile/calendar-mobile',
  '@profile/teach-hub-mobile': 'app_mobile/teach-hub-mobile',
  '@profile/teach-hub-desktop': 'app_desktop/teach-hub-desktop',
  '@profile/lan-drop': 'app_desktop/lan-drop',
};

const rel = dirByName[pkgName];
if (!rel) {
  console.error(`unknown native package: ${pkgName}`);
  process.exit(1);
}

const pkgJson = join(root, rel, 'package.json');
if (!existsSync(pkgJson)) {
  console.error(
    `[native] missing ${rel}/package.json — run:\n  git submodule update --init --recursive ${rel}`,
  );
  process.exit(1);
}

if (!nativeEnabled) {
  console.error(
    `[native] ${pkgName} is not in the default workspace.\n` +
      `  pnpm native:enable && pnpm install\n` +
      `then retry.`,
  );
  process.exit(1);
}

try {
  const require = createRequire(join(root, 'package.json'));
  require.resolve(`${pkgName}/package.json`, { paths: [root] });
} catch {
  console.error(
    `[native] ${pkgName} not linked — run pnpm install after native:enable`,
  );
  process.exit(1);
}
