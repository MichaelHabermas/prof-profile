/**
 * Scroll-synced chat suggestions: matches nav "reading line" + optional project focus
 * (IntersectionObserver on .project-card). Rebuilds #chat-suggestions chips.
 */

const SUGGESTIONS_BY_SECTION = {
  hero: [
    'What does Michael focus on?',
    'Summarize his background in one paragraph',
    'How would he describe working at Zebra?',
    'What should I look at first on this page?',
  ],
  skills: [
    'What AI tools has he worked with?',
    'How does he use Electron in production?',
    'What is his strongest frontend stack?',
    'Languages and frameworks at a glance?',
  ],
  projects: [
    'Tell me about Aurora Focus',
    'What projects are in Selected Work?',
    'Which project shows RAG in the browser?',
    'Compare CollabBoard and Chatty',
  ],
  experience: [
    'What does he do at Zebra?',
    'Tell me about his Scrum Master role',
    'What is his teaching experience at BloomTech?',
    'How does he use AI in daily workflow?',
  ],
};

const PROJECT_SUGGESTIONS = {
  aurora: [
    "What is Aurora Focus and Pixi.js's role?",
    'Machine vision + HMI: what was his scope?',
    'Electron and RxJS in production: how?',
    'Team leadership on the Aurora project?',
  ],
  speaq: [
    'What is Speaq and how was it built?',
    'How does AWS Polly fit in?',
    'React Native vs Expo for this app?',
    'Timeline from Figma to MVP?',
  ],
  collabboard: [
    'How does the AI board agent work?',
    'Konva + Firebase: architecture notes?',
    'What tests cover CollabBoard?',
    'Groq in the stack: how is it used?',
  ],
  ragatha: [
    'How does the in-browser RAG work?',
    'TF-IDF vs neural retrieval: why?',
    'IndexedDB and privacy in RAGatha?',
    'What should I try in the demo?',
  ],
  chatty: [
    'Explain the FastAPI + Groq proxy design',
    'Why SSE and observability headers?',
    'Same-origin vs dev proxy: how?',
    'How are API keys kept off the client?',
  ],
};

const HINT_BY_SECTION = {
  hero: 'Intro',
  skills: 'Technical stack',
  projects: 'Selected Work',
  experience: 'Experience',
};

export function initAttentionChatSuggestions() {
  const container = document.getElementById('chat-suggestions');
  const hintEl = document.getElementById('chat-context-hint');
  const projectsSection = document.getElementById('projects');
  const cards = projectsSection
    ? Array.from(
        projectsSection.querySelectorAll('.project-card[data-chat-topic]')
      )
    : [];

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sectionId = 'hero';
  let projectTopic = null;
  let projectLabel = null;
  let raf = 0;

  function getSuggestionsForState() {
    if (sectionId === 'projects' && projectTopic && PROJECT_SUGGESTIONS[projectTopic]) {
      return PROJECT_SUGGESTIONS[projectTopic];
    }
    return SUGGESTIONS_BY_SECTION[sectionId] || SUGGESTIONS_BY_SECTION.hero;
  }

  function updateHint() {
    if (!hintEl) return;
    if (sectionId === 'projects' && projectLabel && !reduceMotion) {
      hintEl.textContent = `Focus · ${projectLabel}`;
      hintEl.hidden = false;
    } else if (sectionId === 'projects') {
      hintEl.textContent = HINT_BY_SECTION.projects;
      hintEl.hidden = false;
    } else {
      const base = HINT_BY_SECTION[sectionId];
      if (base) {
        hintEl.textContent = base;
        hintEl.hidden = false;
      } else {
        hintEl.hidden = true;
      }
    }
  }

  function renderButtons() {
    if (!container) return;
    const list = getSuggestionsForState();
    container.replaceChildren();
    for (const text of list) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-suggestion';
      btn.textContent = text;
      container.appendChild(btn);
    }
    updateHint();
  }

  function scheduleRender() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      renderButtons();
    });
  }

  const ratios = new Map();
  cards.forEach((el) => ratios.set(el, 0));

  /** Approximate visible ratio when IO has not fired yet (e.g. deep link to #projects). */
  function syncRatiosFromRects() {
    const vh = window.innerHeight || 0;
    if (!vh) return;
    for (const el of cards) {
      const r = el.getBoundingClientRect();
      const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const ratio = h / Math.max(r.height, 1);
      ratios.set(el, ratio);
    }
  }

  function pickPrimaryProject() {
    if (reduceMotion || sectionId !== 'projects' || !cards.length) {
      return { topic: null, label: null };
    }
    let bestEl = null;
    let bestR = 0;
    for (const [el, r] of ratios) {
      if (r > bestR) {
        bestR = r;
        bestEl = el;
      }
    }
    if (!bestEl || bestR < 0.12) {
      return { topic: null, label: null };
    }
    const topic = bestEl.getAttribute('data-chat-topic') || null;
    const titleEl = bestEl.querySelector('.project-title');
    const label = titleEl ? titleEl.textContent.trim() : topic;
    return { topic, label };
  }

  function onIntersection(entries) {
    for (const e of entries) {
      ratios.set(e.target, e.intersectionRatio);
    }
    const { topic, label } = pickPrimaryProject();
    if (topic !== projectTopic || label !== projectLabel) {
      projectTopic = topic;
      projectLabel = label;
      scheduleRender();
    }
  }

  if (!reduceMotion && cards.length && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(onIntersection, {
      root: null,
      rootMargin: '-20% 0px -35% 0px',
      threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.5, 0.75, 1],
    });
    cards.forEach((c) => io.observe(c));
  }

  function onSectionChange(id) {
    sectionId = id || 'hero';
    if (sectionId !== 'projects') {
      projectTopic = null;
      projectLabel = null;
    } else if (!reduceMotion) {
      syncRatiosFromRects();
      const picked = pickPrimaryProject();
      projectTopic = picked.topic;
      projectLabel = picked.label;
    }
    scheduleRender();
  }

  function refresh() {
    scheduleRender();
  }

  renderButtons();

  return {
    onSectionChange,
    refresh,
  };
}
