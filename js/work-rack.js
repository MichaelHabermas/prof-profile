/**
 * Selected Work: rack-focus dim/blur on sibling cards. Clears after 5s while
 * pointer or focus may still be on the card (CSS :hover cannot do this alone).
 */
const RACK_MS = 5000;

export function initWorkRack() {
  const grid = document.querySelector('.work-grid');
  if (!grid) return;

  function getCards() {
    return Array.from(grid.querySelectorAll('.project-card'));
  }

  let timerId = null;

  function clearRack() {
    grid.classList.remove('work-rack--on');
    getCards().forEach((c) => c.classList.remove('work-rack--current'));
    clearTimeout(timerId);
    timerId = null;
  }

  function isMovingToAnotherCardInGrid(relatedTarget) {
    if (!relatedTarget || !grid.contains(relatedTarget)) return false;
    return Boolean(relatedTarget.closest('.project-card'));
  }

  function armRack(card) {
    if (!card || !grid.contains(card)) return;
    clearTimeout(timerId);
    grid.classList.add('work-rack--on');
    getCards().forEach((c) => {
      c.classList.toggle('work-rack--current', c === card);
    });
    timerId = setTimeout(() => {
      timerId = null;
      clearRack();
    }, RACK_MS);
  }

  getCards().forEach((card) => {
    card.addEventListener('mouseenter', () => {
      armRack(card);
    });

    card.addEventListener('mouseleave', (e) => {
      if (isMovingToAnotherCardInGrid(e.relatedTarget)) return;
      clearRack();
    });
  });

  grid.addEventListener(
    'focusin',
    (e) => {
      const card = e.target.closest?.('.project-card');
      if (card && grid.contains(card)) armRack(card);
    },
    true
  );

  grid.addEventListener(
    'focusout',
    () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!grid.contains(active)) clearRack();
      }, 0);
    },
    true
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearRack();
  });
}
