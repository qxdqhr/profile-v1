/** 纯函数：不依赖 auth server / DB，可供离线 verify 引用。 */
export function isAdminRole(role?: string | null): boolean {
  const normalized = role?.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}
