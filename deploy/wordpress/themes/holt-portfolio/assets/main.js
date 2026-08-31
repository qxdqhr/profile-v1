(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.holt-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  document.querySelectorAll('.holt-reveal').forEach(function (el, index) {
    if (!el.classList.contains('holt-reveal--delay-1') &&
        !el.classList.contains('holt-reveal--delay-2') &&
        !el.classList.contains('holt-reveal--delay-3') &&
        index > 0) {
      el.classList.add('holt-reveal--delay-' + Math.min(index, 3));
    }
    observer.observe(el);
  });
})();
