/**
 * Pointer-linked specular highlight on hero frames (fine pointer + motion allowed).
 */
export function initHeroSpecular() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');

  function active() {
    return !reduce.matches && !coarse.matches;
  }

  const frames = document.querySelectorAll('.hero-frame');
  if (!frames.length) return;

  const handlers = new Map();

  function onMove(frame) {
    return (e) => {
      if (!active()) return;
      const rect = frame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      frame.style.setProperty('--focus-x', `${Math.max(0, Math.min(100, x))}%`);
      frame.style.setProperty('--focus-y', `${Math.max(0, Math.min(100, y))}%`);
      frame.style.setProperty('--focus-alpha', '1');
    };
  }

  function onLeave(frame) {
    return () => {
      frame.style.setProperty('--focus-alpha', '0');
    };
  }

  function bind() {
    frames.forEach((frame) => {
      const prev = handlers.get(frame);
      if (prev) {
        frame.removeEventListener('pointermove', prev.move);
        frame.removeEventListener('pointerleave', prev.leave);
        handlers.delete(frame);
      }
      if (!active()) {
        frame.style.setProperty('--focus-alpha', '0');
        return;
      }
      const move = onMove(frame);
      const leave = onLeave(frame);
      handlers.set(frame, { move, leave });
      frame.addEventListener('pointermove', move, { passive: true });
      frame.addEventListener('pointerleave', leave);
    });
  }

  bind();
  reduce.addEventListener('change', bind);
  coarse.addEventListener('change', bind);
}
