/** 已迁移至 config/app.config.*.yaml，禁止经历史 DB 配置表写入 */
export const BOOTSTRAP_CONFIG_KEY_PREFIXES = [
  'DATABASE_',
  'BETTER_AUTH_',
  'NEXT_PUBLIC_APP_',
  'NEXTAUTH_',
  'SA2KIT_',
  'ALIYUN_OSS_',
  'ALIYUN_SMS_',
  'ALIYUN_CDN_',
] as const;

export const BOOTSTRAP_CONFIG_KEYS = new Set([
  'DATABASE_URL',
  'REACT_APP_API_URL',
]);

export function isBootstrapConfigKey(key: string): boolean {
  if (BOOTSTRAP_CONFIG_KEYS.has(key)) return true;
  return BOOTSTRAP_CONFIG_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export const BOOTSTRAP_CONFIG_MIGRATION_HINT =
  '该配置已迁移至 config/app.config.local.yaml（开发）或 production.enc.yaml（生产），请编辑 YAML 后重启应用。';

export function assertEditableConfigKey(key: string): void {
  if (isBootstrapConfigKey(key)) {
    throw new Error(BOOTSTRAP_CONFIG_MIGRATION_HINT);
  }
}
