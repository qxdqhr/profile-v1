import { readFileSync, writeFileSync } from 'node:fs';
import {
  appConfigSchema,
  getAppConfig,
  loadAppConfig,
  resetAppConfigCache,
  resolveAppConfigPath,
  type AppConfig,
} from 'sa2kit/common/config/bootstrap';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type BusinessConfig = NonNullable<AppConfig['business']>;

export function getBusinessConfig(): BusinessConfig {
  return getAppConfig().business ?? {};
}

export function persistAppConfigFile(
  mutator: (draft: Record<string, unknown>) => void,
): AppConfig {
  const filePath = resolveAppConfigPath();
  const raw = readFileSync(filePath, 'utf8');
  const parsed = parseYaml(raw) as Record<string, unknown>;
  mutator(parsed);

  const validated = appConfigSchema.parse(parsed);
  writeFileSync(filePath, stringifyYaml(validated, { lineWidth: 0 }), 'utf8');

  resetAppConfigCache();
  loadAppConfig({ logDoctor: false });
  return getAppConfig();
}

export function updateBusinessConfig(
  updater: (business: BusinessConfig) => BusinessConfig,
): BusinessConfig {
  const next = persistAppConfigFile((draft) => {
    const current = (draft.business ?? {}) as BusinessConfig;
    draft.business = updater(current);
  });
  return next.business ?? {};
}
