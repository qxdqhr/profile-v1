import { BoothVaultService } from 'sa2kit/vocaloidBooth';
import {
  BoothRedeemGuard,
  InMemoryBoothAuditSink,
  InMemoryBoothVaultStore,
  createAuditLogger,
} from 'sa2kit/vocaloidBooth/server';

const store = new InMemoryBoothVaultStore();
const auditSink = new InMemoryBoothAuditSink();

export const vocaloidBoothTestRuntime = {
  store,
  auditSink,
  service: new BoothVaultService({
    store,
    redeemGuard: new BoothRedeemGuard({ maxAttempts: 8, windowMs: 60_000, blockMs: 120_000 }),
    onAuditEvent: createAuditLogger(auditSink),
  }),
};
