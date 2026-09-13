import TicketMonitorAuthShell from '../lib/TicketMonitorAuthShell';
import { TicketMonitorPage } from 'sa2kit/business/ticketMonitor/ui/web';

export default function TicketMonitorHomePage() {
  return (
    <TicketMonitorAuthShell>
      <TicketMonitorPage />
    </TicketMonitorAuthShell>
  );
}
