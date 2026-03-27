## Learned User Preferences
- Avoid location claims about the user in portfolio content.
- Avoid hard performance claims (for example, `1ms`) unless explicitly requested.
- Prefer iridescent styling over generic purple-gradient aesthetics.
- When asked to avoid pill/capsule chips, style tags (including `.pill`) with non-capsule treatments.
- For Bubble chat interactions, prefer short, punchy sound effects over longer clips.

## Learned Workspace Facts
- This is a static portfolio site with no build system, tests, or lint pipeline.
- Primary files are `index.html`, `css/main.css`, and modular scripts under `js/`.
- The chat feature uses a Netlify Function endpoint at `/.netlify/functions/chat` in deployment.
- Local testing of Netlify Functions should use `netlify dev` instead of a plain static server.
- The GitHub project injection script depends on `AUTO_PROJECTS` markers in `index.html`.
