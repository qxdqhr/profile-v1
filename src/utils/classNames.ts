/**
 * 合并多个CSS类名
 * @param classes 要合并的CSS类名数组，可以包含undefined或null值
 * @returns 合并后的CSS类名字符串
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
} 