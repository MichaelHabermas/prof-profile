/**
 * Scroll progress for --scroll-progress (always) and --iris-tide (ambient; off when reduced motion).
 */
export function initIrisTide() {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  let raf = 0;

  function tick() {
    raf = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const t = Math.min(1, Math.max(0, window.scrollY / max));
    root.style.setProperty('--scroll-progress', t.toFixed(4));
    root.style.setProperty('--iris-tide', mq.matches ? '0' : t.toFixed(4));
  }

  function onScrollOrResize() {
    if (raf) return;
    raf = requestAnimationFrame(tick);
  }

  tick();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  mq.addEventListener('change', tick);
}
