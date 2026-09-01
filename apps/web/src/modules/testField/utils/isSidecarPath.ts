/** 同域旁路（nginx 静态 / PHP），不可用 Next 客户端路由 */
export function isSidecarPath(path: string): boolean {
  return path.startsWith('/games/') || path.startsWith('/wp/');
}
