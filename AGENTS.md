# AGENTS.md

## Project Overview

This is a personal portfolio website built with:

- **HTML5** - Single-page site; custom CSS in `css/main.css`, behavior in `js/` (ES modules)
- **Tailwind CSS** (via CDN) - Utility-first CSS framework
- **Google Fonts** - Sora (sans-serif) and DM Serif Display (serif)
- **No build system** - Static files, served directly

There is no package.json, no build commands, no linting, and no tests in this project.

---

## Build / Lint / Test Commands

Since this is a static HTML site with no build system, there are no traditional commands. To preview the site:

```bash
# Recommended: local server (required for ES module imports)
python3 -m http.server 8000
# Then open http://localhost:8000/
```

To validate HTML:

```bash
# Check HTML syntax
python3 -c "from html.parser import HTMLParser; HTMLParser().feed(open('index.html').read())"
```

There are no tests in this project.

---

## Code Style Guidelines

### General Principles

- **Simplicity first** - This is a static site; avoid over-engineering
- **Semantic HTML** - Use proper HTML5 elements (header, nav, section, article, footer)
- **Accessibility** - Include proper ARIA labels, alt text, and semantic structure

### HTML Structure

- Use 2-space indentation
- Keep custom CSS in `css/main.css` and scripts in `js/` (linked from `index.html`)
- Place `<script type="module">` at the end of `<body>`
- Use lowercase for all tags and attributes

```html
<!-- Good -->
<header class="site-header">
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>

<!-- Avoid -->
<HEADER CLASS="SITE-HEADER">
  <NAV>
    <UL><LI><A HREF="#about">About</A></LI></UL>
  </NAV>
</HEADER>
```

### CSS Conventions

- Use CSS custom properties (variables) for colors and spacing
- Group related properties together
- Use kebab-case for class names and custom properties
- Prefer utility classes from Tailwind when available
- Keep custom CSS minimal; leverage Tailwind

```css
/* Good */
:root {
  --bg-primary: #f7f7f9;
  --text-primary: #0c0c14;
  --accent: #c0b8f8;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
}
```

### JavaScript

- Use vanilla JavaScript (no frameworks needed)
- Keep scripts minimal; most interactivity can be CSS-based
- Use `const` and `let` instead of `var`
- Add `defer` attribute to script tags if placed in head

```javascript
// Good
const nav = document.querySelector('.nav');
const links = nav.querySelectorAll('a');

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
```

### Naming Conventions

- **Classes**: kebab-case (e.g., `.card`, `.iris-border`, `.nav-link`)
- **Variables**: camelCase (e.g., `isVisible`, `scrollPosition`)
- **Constants**: UPPER_SNAKE_CASE for magic numbers
- **CSS variables**: kebab-case (e.g., `--bg-primary`)

### Performance

- Avoid JavaScript for effects that can be done with CSS animations
- Use CSS transforms instead of animating properties like `top`, `left`

### Color Palette

The project uses an iridescent color scheme:

- Background: `#f7f7f9` (light gray)
- Surface: `#ffffff` (white)
- Text: `#0c0c14` (near black)
- Muted: `#8888a0` (gray-purple)

Iridescent accents:

- Lavender: `#c0b8f8`
- Rose: `#f0b8d8`
- Sky: `#b8e8f8`
- Mint: `#b8f8e8`
- Gold: `#f8e8b8`
- Violet: `#e8c0f8`

### Accessibility Requirements

- All images must have alt text
- Links should have descriptive text (avoid "click here")
- Use proper heading hierarchy (h1 → h2 → h3)
- Ensure sufficient color contrast (4.5:1 for text)
- Include skip-to-content link for keyboard users

---

## User Preferences (from prior sessions)

- **Portfolio content**: Do not include location claims about the user
- **Avoid performance claims** like `1ms` or sub-millisecond latency unless explicitly requested
- **Avoid generic purple-gradient aesthetics** - the iridescent style is preferred
- **Tag/chip styling**: When the user asks to avoid pill or capsule shapes, restyle tags (including `.pill`) to non-capsule treatments such as underlined text or square corners rather than rounded chip backgrounds

---

## File Structure

```bash
prof-profile/
├── index.html          # Main portfolio markup
├── assets/             # Custom visuals (e.g. hero SVGs)
├── css/
│   └── main.css        # Custom styles (Tailwind remains via CDN)
├── js/
│   ├── main.js         # Entry (ES modules)
│   ├── scroll-reveal.js
│   └── chat/           # Portfolio chat widget (RAG + OpenAI)
├── scripts/
│   └── add-github-project.js
├── docs/
│   ├── 1.html          # Additional documentation page
│   └── Michael_Habermas_CV.pdf
├── LICENSE
├── README.md
├── AGENTS.md           # This file
└── .gitignore
```

---

## Working with This Project

1. Edit `index.html` for markup; `css/main.css` for custom CSS; `js/` for behavior (ES modules, serve over HTTP)
2. Preview with a local server (see README) so module imports load
3. Use Tailwind CDN classes for styling; extend in `css/main.css` when needed
4. No CI/CD pipeline - manual deployment only

---

## Tips for Agents

- When adding new sections to the portfolio, maintain consistent styling with existing components
- The iridescent effects (`.iris-border`, `.iris-text`, `.iris-underline`) should be used sparingly
- Test responsive behavior on mobile widths (320px - 768px)
- Avoid adding external dependencies beyond what's already included (Tailwind CDN, Google Fonts)
