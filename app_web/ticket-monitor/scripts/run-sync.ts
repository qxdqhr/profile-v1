/**
 * CLI sync entry for ticket-monitor (Phase H1b).
 * Usage: pnpm ticket-monitor:sync
 */
import { db } from '@profile/db';
import {
  createTicketMonitorDbService,
  syncTicketMonitorEvents,
} from 'sa2kit/business/ticketMonitor/server';

async function main() {
  const ticketMonitorDb = createTicketMonitorDbService(db);
  const result = await syncTicketMonitorEvents(ticketMonitorDb);
  console.log('[ticket-monitor:sync]', JSON.stringify(result, null, 2));
  process.exit(result.status === 'failed' ? 1 : 0);
}

main().catch((error) => {
  console.error('[ticket-monitor:sync] failed:', error);
  process.exit(1);
});
