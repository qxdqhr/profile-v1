#!/usr/bin/env node
/**
 * Architecture remediation gate:
 * 1) Forbid re-introducing main-web API mounts for cutover domains,
 *    and forbid sidecar apps from remounting `/api/auth`.
 * 2) Phase G8: packages/ may only contain sa2kit + sa2kit-ui (+ README)
 *    and sa2kit-skill (Agent skills submodule; not a pnpm/npm package).
 *    Forbid other third shared packages under packages/.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const forbiddenMounts = [
  'app_web/web/src/app/api/showmasterpiece',
  'app_web/web/src/app/api/node-notes',
  'app_web/calendar/app/api/ai',
  'app_web/teach-hub/app/api/ai',
  'app_web/calendar/app/api/auth',
  'app_web/teach-hub/app/api/auth',
  'app_web/showmasterpiece/app/api/auth',
  'app_web/node-notes/app/api/auth',
  'app_web/money-research/app/api/auth',
];

const mountHits = forbiddenMounts.filter((rel) => existsSync(resolve(root, rel)));
if (mountHits.length > 0) {
  console.error('[gate:architecture] Forbidden dual-mount paths present:');
  for (const h of mountHits) console.error(`  - ${h}`);
  console.error(
    'See docs/code-review/CROSS-CUTTING.md and docs/architecture/AUTH-SURFACE-AUDIT.md.',
  );
  process.exit(1);
}

const packagesDir = resolve(root, 'packages');
const allowedPackageEntries = new Set([
  'sa2kit',
  'sa2kit-ui',
  'sa2kit-skill', // Agent skills submodule; not workspace / npm
  'README.md',
]);
if (existsSync(packagesDir)) {
  const entries = readdirSync(packagesDir).filter((name) => !name.startsWith('.'));
  const illegal = entries.filter((name) => !allowedPackageEntries.has(name));
  if (illegal.length > 0) {
    console.error(
      '[gate:architecture] packages/ may only contain sa2kit + sa2kit-ui + sa2kit-skill (+ README.md). Found:',
    );
    for (const name of illegal) {
      const full = join(packagesDir, name);
      const kind = existsSync(full) && statSync(full).isDirectory() ? 'dir' : 'file';
      console.error(`  - ${name} (${kind})`);
    }
    console.error(
      'Phase G8: put profile glue under host/; domain code under sa2kit/business|common. See BLUEPRINT §14 G8. Skills → sa2kit-skill.',
    );
    process.exit(1);
  }
}

console.log(
  '[gate:architecture] OK — dual-mount clean; packages/ only sa2kit + sa2kit-ui + sa2kit-skill.',
);
