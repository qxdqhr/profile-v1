import TicketMonitorAuthShell from '../../lib/TicketMonitorAuthShell';
import { TicketMonitorConfigPage } from 'sa2kit/business/ticketMonitor/ui/web';

export default function TicketMonitorConfigRoute() {
  return (
    <TicketMonitorAuthShell>
      <TicketMonitorConfigPage />
    </TicketMonitorAuthShell>
  );
}
