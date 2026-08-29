#!/usr/bin/env node
/**
 * U6 UI 统一门禁（profile-v1）
 * - 禁止 animal-island-ui
 * - 禁止业务源码直引 sa2kit/common/components
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function rg(pattern) {
  const result = spawnSync(
    'rg',
    [
      '-n',
      '--glob',
      '!**/node_modules/**',
      '--glob',
      '!**/.next*/**',
      '--glob',
      '!**/doc/**',
      '--glob',
      '!**/docs/**',
      '-g',
      '*.{ts,tsx}',
      pattern,
      '.',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.status === 1) return '';
  if (result.status !== 0) {
    throw new Error(result.stderr || `rg failed: ${result.status}`);
  }
  return (result.stdout || '').trim();
}

const failures = [];

const animal = rg("from ['\"]animal-island-ui['\"]|require\\(['\"]animal-island-ui['\"]\\)");
if (animal) {
  failures.push(['禁止 animal-island-ui', animal]);
}

const components = rg("from ['\"]sa2kit/common/components['\"]");
if (components) {
  failures.push([
    '禁止直引 sa2kit/common/components（改用 sa2kit/common/ui*）',
    components,
  ]);
}

if (failures.length) {
  console.error('✗ UI 统一门禁失败（U6）\n');
  for (const [title, body] of failures) {
    console.error(`## ${title}\n${body}\n`);
  }
  process.exit(1);
}

console.log('✓ UI 统一门禁通过（无 animal-island-ui / 无 common/components 直引）');
