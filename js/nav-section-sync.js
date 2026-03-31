/**
 * Highlights the nav link for the section that owns the "reading line" below the fixed nav.
 * @param {(sectionId: string) => void} [onActiveSectionChange] — e.g. attention-aware chat chips
 */
export function initNavSectionSync(onActiveSectionChange) {
  const links = Array.from(document.querySelectorAll('nav .nav-link[href^="#"]'));
  if (!links.length) return;

  const sections = links
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  /** Pixels from viewport top; ~nav height + small offset */
  const LINE = 112;

  function applyActive(id) {
    links.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('nav-link-active', match);
      if (match) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function update() {
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= LINE) current = section;
    }
    applyActive(current.id);
    if (typeof onActiveSectionChange === 'function') {
      onActiveSectionChange(current.id);
    }
  }

  let raf = 0;
  function onScrollOrResize() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  update();
}
