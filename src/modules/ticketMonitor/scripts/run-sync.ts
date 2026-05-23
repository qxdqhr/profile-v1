import { config } from 'dotenv';

config({ path: '.env.development' });
config();

import { syncTicketMonitorEvents } from '../server/syncEvents';

async function main() {
  const result = await syncTicketMonitorEvents();
  console.log('[ticket-monitor:sync]', JSON.stringify(result, null, 2));
  process.exit(result.status === 'failed' ? 1 : 0);
}

main().catch((error) => {
  console.error('[ticket-monitor:sync] failed:', error);
  process.exit(1);
});
