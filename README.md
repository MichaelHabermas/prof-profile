# prof-profile

## Overview

Personal portfolio as a static single-page site:

- **HTML5** — single `index.html`
- **Tailwind CSS** (CDN) for layout utilities; **custom design system** in `css/main.css` (tokens, iridescent hero, components)
- **Vanilla ES modules** under `js/` (no framework)
- **No build step** — serve files as-is

### JavaScript modules

| Module | Role |
|--------|------|
| `js/main.js` | Entry: wires feature modules |
| `js/iris-tide.js` | Scroll-linked `--iris-tide` and top progress sliver |
| `js/nav-section-sync.js` | Scroll-spy nav (`nav-link-active`); optional section callback |
| `js/hero-specular.js` | Pointer “lens” on hero frames |
| `js/scroll-reveal.js` | Section entrance animation |
| `js/chat/attention-suggestions.js` | Section- and project-aware chat starter chips |
| `js/chat/*` | Floating chat UI (bubble animator, retriever), Netlify Function client |

See **[FEATURES.md](FEATURES.md)** for implementation notes (scroll tide, nav sync, attention-aware chat suggestions, hero specular, etc.).

### Backend

- **Netlify Function** at `netlify/functions/chat.js` — exposed as `/.netlify/functions/chat` in deployment.

## Local preview

ES modules need a local server (`file://` often blocks imports).

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` or `http://localhost:8000/index.html`.

## Local chat testing (Netlify Functions)

The chat client posts to `/.netlify/functions/chat`. A plain static server will not serve that route, so chat will fail there.

Use Netlify CLI:

```bash
# one-time install
npm i -g netlify-cli

# from project root
netlify dev
```

Use the URL Netlify prints (often `http://localhost:8888`).

### Quick function health check

With `netlify dev` running:

```bash
curl -i -X POST "http://localhost:8888/.netlify/functions/chat" \
  -H "Content-Type: application/json" \
  --data '{"messages":[{"role":"user","content":"hello"}],"model":"openai","private":true}'
```

Expected: HTTP 200 and a text response body.

## Extra pages

- `docs/1.html`
- `docs/Michael_Habermas_CV.pdf`

## Adding “Selected Work” cards

The projects grid is curated HTML in `index.html`, with inject markers:

- `<!-- AUTO_PROJECTS_START -->`
- `<!-- AUTO_PROJECTS_END -->`

A helper script inserts new cards between those markers.

## Script: `scripts/add-github-project.js`

Calls the GitHub API (including `topics`) and injects a project card into `index.html`.

### Usage

```bash
node scripts/add-github-project.js <github-repo-url> [--dry-run]
```

### Supported repo URL formats

- `https://github.com/<owner>/<repo>`
- `https://github.com/<owner>/<repo>.git`
- `git@github.com:<owner>/<repo>.git`

### What the card includes

- Title: repository name
- Subtitle: owner login
- Description: repo description (fallback: `New project`)
- Tech tags: GitHub `topics` (`.pill` elements)
- Link: repository URL

### Deduping

Skips insert if a marker already exists:

- `<!-- auto-project: <owner>/<repo> -->`

### `--dry-run`

Prints the HTML without editing `index.html`:

```bash
node scripts/add-github-project.js https://github.com/<owner>/<repo> --dry-run
```

### Troubleshooting

- If markers are missing, ensure `index.html` still contains `AUTO_PROJECTS_START` and `AUTO_PROJECTS_END`.
