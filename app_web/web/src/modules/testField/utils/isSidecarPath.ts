/** 同域旁路与独立 Next 子应用，不可用主站 Next 客户端路由 */
export function isSidecarPath(path: string): boolean {
  return (
    path.startsWith('/games/') ||
    path.startsWith('/wp/') ||
    path.startsWith('/calendar') ||
    path.startsWith('/teach-hub') ||
    path.startsWith('/showmasterpiece') ||
    path.startsWith('/money-research') ||
    path.startsWith('/node-notes') ||
    /^https?:\/\//.test(path)
  );
}
