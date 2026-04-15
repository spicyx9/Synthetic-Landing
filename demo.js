/* ===================================
   SYNTHETIC SWARM DEMO — Scoped JS
   All queries scoped to .demo-wrapper
   =================================== */

(function () {
  'use strict';

  var wrapper = document.querySelector('.demo-wrapper');
  if (!wrapper) return;

  // Scroll animations (IntersectionObserver) for demo elements
  var animatedEls = wrapper.querySelectorAll('[data-animate]');
  if (animatedEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animatedEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }



})();
