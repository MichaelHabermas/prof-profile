# prof-profile

## Overview

Personal portfolio website built as a static single-page project:

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (no framework)
- Served directly (no build step)

## Local preview

Option 1: open `index.html` in a browser.

Option 2: serve locally:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`

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
