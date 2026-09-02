import { ensureAppConfigLoaded } from '@/lib/config/init';
import {
  getBusinessConfig,
  updateBusinessConfig,
  type BusinessConfig,
} from '@/lib/config/persist-app-config';

export function readBusinessConfig(): BusinessConfig {
  ensureAppConfigLoaded();
  return getBusinessConfig();
}

export function writeBusinessConfig(
  updater: (business: BusinessConfig) => BusinessConfig,
): BusinessConfig {
  ensureAppConfigLoaded();
  return updateBusinessConfig(updater);
}
