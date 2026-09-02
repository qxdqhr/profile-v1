/** WebView 内课时 HTML 滚动追踪与定位（对齐 teach-hub-core LessonViewer） */

export const LESSON_SCROLL_TRACKER_JS = `
(function () {
  if (window.__lessonScrollTrackerInstalled) return;
  window.__lessonScrollTrackerInstalled = true;

  function readProgress() {
    var el = document.scrollingElement || document.documentElement;
    var body = document.body;
    var scrollTop = el.scrollTop || body.scrollTop || 0;
    var scrollHeight = Math.max(el.scrollHeight, body.scrollHeight, 1);
    var clientHeight = el.clientHeight || window.innerHeight || 1;
    var maxScroll = Math.max(0, scrollHeight - clientHeight);
    if (maxScroll <= 0) return 100;
    return Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
  }

  function report() {
    if (window.__lessonScrollDragging) return;
    if (!window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'lesson-scroll',
      percent: readProgress(),
    }));
  }

  window.__setLessonScrollPercent = function (percent) {
    var el = document.scrollingElement || document.documentElement;
    var body = document.body;
    var scrollHeight = Math.max(el.scrollHeight, body.scrollHeight, 1);
    var clientHeight = el.clientHeight || window.innerHeight || 1;
    var maxScroll = Math.max(0, scrollHeight - clientHeight);
    var top = (percent / 100) * maxScroll;
    el.scrollTop = top;
    body.scrollTop = top;
    window.scrollTo(0, top);
  };

  document.addEventListener('scroll', report, true);
  window.addEventListener('scroll', report, true);
  window.addEventListener('resize', report);
  setTimeout(report, 120);
  setTimeout(report, 500);
  setTimeout(report, 1200);
})();
true;
`;

export function buildSetScrollPercentScript(percent: number): string {
  const safe = Math.min(100, Math.max(0, percent));
  return `
    window.__lessonScrollDragging = true;
    if (typeof window.__setLessonScrollPercent === 'function') {
      window.__setLessonScrollPercent(${safe});
    }
    true;
  `;
}

export function buildEndScrollDragScript(): string {
  return `
    window.__lessonScrollDragging = false;
    true;
  `;
}
