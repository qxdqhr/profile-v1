export type ConfigEnvironment = 'development' | 'production';

const VALID_ENVIRONMENTS = new Set<ConfigEnvironment>([
  'development',
  'production',
]);

/** 与 NODE_ENV 对齐的默认配置环境 */
export function defaultConfigEnvironment(): ConfigEnvironment {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

export function resolveConfigEnvironment(
  value: string | null | undefined,
  fallback?: ConfigEnvironment,
): ConfigEnvironment {
  const trimmed = value?.trim();
  if (trimmed && VALID_ENVIRONMENTS.has(trimmed as ConfigEnvironment)) {
    return trimmed as ConfigEnvironment;
  }
  return fallback ?? defaultConfigEnvironment();
}
