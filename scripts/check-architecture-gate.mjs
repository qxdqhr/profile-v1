#!/usr/bin/env node
/**
 * Architecture remediation gate (D1):
 * Forbid re-introducing main-web API mounts for cutover domains,
 * and forbid sidecar apps from remounting `/api/auth`.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const forbidden = [
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

const hits = forbidden.filter((rel) => existsSync(resolve(root, rel)));
if (hits.length > 0) {
  console.error('[gate:architecture] Forbidden dual-mount paths present:');
  for (const h of hits) console.error(`  - ${h}`);
  console.error(
    'See docs/code-review/CROSS-CUTTING.md and docs/architecture/AUTH-SURFACE-AUDIT.md.',
  );
  process.exit(1);
}

console.log('[gate:architecture] OK — no forbidden dual-mount paths.');
