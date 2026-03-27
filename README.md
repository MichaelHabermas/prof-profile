# prof-profile

## Overview

Personal portfolio website built as a static single-page project:

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (no framework)
- Served directly (no build step)

## Local preview

JavaScript is split into ES modules (`js/main.js`); use a local server so imports resolve reliably (opening `index.html` via `file://` may not load modules in every browser).

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` or `http://localhost:8000/index.html`.

## Local chatbot testing (Netlify Functions)

The chatbot calls a Netlify Function endpoint at `/.netlify/functions/chat`.
If you run a plain static server (for example `python3 -m http.server` or VS Code Live Server on `:5500`), that function route will return `404`/`405` and chat will not work correctly.

Use Netlify dev for chatbot testing:

```bash
# one-time install
npm i -g netlify-cli

# from project root
netlify dev
```

Open the URL printed by Netlify CLI (usually `http://localhost:8888`) and test chat there.

### Quick function health check

With `netlify dev` running, test the function directly:

```bash
curl -i -X POST "http://localhost:8888/.netlify/functions/chat" \
  -H "Content-Type: application/json" \
  --data '{"messages":[{"role":"user","content":"hello"}],"model":"openai","private":true}'
```

Expected result: HTTP 200 and a text response body.

## Extra pages

- `docs/1.html`
- `docs/Michael_Habermas_CV.pdf`

## Adding new “Selected Work” cards

The “Selected Work” section is mostly curated static HTML in `index.html`.

To support quick adding, `index.html` includes marker comments inside the projects grid:

- `<!-- AUTO_PROJECTS_START -->`
- `<!-- AUTO_PROJECTS_END -->`

The helper script inserts a new project card between those markers.

## Script: `scripts/add-github-project.js`

Fetches repo metadata from the GitHub API (including `topics`) and injects a new card into `index.html`.

### Usage

```bash
node scripts/add-github-project.js <github-repo-url> [--dry-run]
```

### Supported GitHub repo URL formats

- `https://github.com/<owner>/<repo>`
- `https://github.com/<owner>/<repo>.git`
- `git@github.com:<owner>/<repo>.git`

### What gets added to the card

- Title: repository name
- Subtitle line: repo owner login
- Description: repository description (fallback: `New project`)
- Tech tags: GitHub `topics` (rendered as `.pill` elements)
- Link: repository URL

### Deduping

The script checks for an existing injected card marker:

- `<!-- auto-project: <owner>/<repo> -->`

If it finds one for that repo, it won’t insert a duplicate.

### `--dry-run`

Use `--dry-run` to print the injected HTML instead of editing `index.html`:

```bash
node scripts/add-github-project.js https://github.com/<owner>/<repo> --dry-run
```

### Troubleshooting

- If the script errors saying it can’t find the markers, ensure `index.html` still contains `AUTO_PROJECTS_START` and `AUTO_PROJECTS_END`.
