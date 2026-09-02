#!/usr/bin/env node
/**
 * Architecture remediation gate (D1):
 * Forbid re-introducing main-web API mounts for cutover domains.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const forbidden = [
  'web/web/src/app/api/showmasterpiece',
  'web/calendar/app/api/ai',
  'web/teach-hub/app/api/ai',
];

const hits = forbidden.filter((rel) => existsSync(resolve(root, rel)));
if (hits.length > 0) {
  console.error('[gate:architecture] Forbidden dual-mount paths present:');
  for (const h of hits) console.error(`  - ${h}`);
  console.error(
    'See docs/architecture/ARCHITECTURE-REMEDIATION-PLAN.md (Phase A/D).',
  );
  process.exit(1);
}

console.log('[gate:architecture] OK — no forbidden dual-mount paths.');
