/**
 * API 返回的课时 HTML 会注入 `<base target="_top" href="/">`（供 Web iframe 导航）。
 * RN WebView 用 loadDataWithBaseURL 渲染时，该 base 会把相对路径指到错误 origin，导致白屏。
 */
export function prepareLessonHtmlForWebView(html: string): string {
  return html.replace(/<base\b[^>]*>/gi, '').trim();
}
