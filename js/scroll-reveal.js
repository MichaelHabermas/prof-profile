export function initScrollReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    },
    { threshold: 0.07 }
  );
  document.querySelectorAll('.appear').forEach((el) => obs.observe(el));
}
