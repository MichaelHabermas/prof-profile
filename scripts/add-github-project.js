#!/usr/bin/env node

/**
 * Adds a new "Selected Work" project card by fetching GitHub repo metadata
 * (including topics) and injecting a card into `index.html`.
 *
 * Usage:
 *   node scripts/add-github-project.js <github-repo-url> [--dry-run]
 *
 * Notes:
 * - This edits `index.html` directly (no build step).
 * - It dedupes by `owner/repo` using a marker comment inside the injected card.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');
const START_TOKEN = '<!-- AUTO_PROJECTS_START -->';
const END_TOKEN = '<!-- AUTO_PROJECTS_END -->';

function usage(exitCode = 1) {
  // eslint-disable-next-line no-console
  console.error('Usage: node scripts/add-github-project.js <github-repo-url> [--dry-run]');
  process.exit(exitCode);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeOwnerRepo(owner, repo) {
  return `${String(owner).trim().toLowerCase()}/${String(repo).trim().toLowerCase()}`;
}

function parseGithubRepoUrl(rawUrl) {
  const url = rawUrl.trim();

  // Handle ssh: git@github.com:owner/repo.git
  const sshMatch = url.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2].replace(/\.git$/i, '') };
  }

  // Handle https://github.com/owner/repo(.git)
  const httpsMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?\/?$/i);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2].replace(/\.git$/i, '') };
  }

  throw new Error(`Unrecognized GitHub repo URL format: ${rawUrl}`);
}

function fetchJson(url) {
  const headers = {
    'user-agent': 'prof-profile-project-card-bot',
    accept: 'application/json',
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let body = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`GitHub API error ${res.statusCode} for ${url}: ${body}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
  });
}

function indentMultiline(text, prefix) {
  return String(text)
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) usage(1);

  const rawUrl = argv.find(a => !a.startsWith('-'));
  const dryRun = argv.includes('--dry-run') || argv.includes('-n');
  if (!rawUrl) usage(1);

  const { owner, repo } = parseGithubRepoUrl(rawUrl);
  const ownerRepoKey = normalizeOwnerRepo(owner, repo); // lower-case

  const apiRepoUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const apiTopicsUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/topics`;

  // Fetch repo + topics in parallel.
  const [repoData, topicsData] = await Promise.all([
    fetchJson(apiRepoUrl),
    fetchJson(apiTopicsUrl).catch(() => ({ names: [] })),
  ]);

  const repoName = repoData && repoData.name ? repoData.name : repo;
  const repoDescription = repoData && repoData.description ? repoData.description : 'New project';
  const repoHtmlUrl = repoData && repoData.html_url ? repoData.html_url : `https://github.com/${owner}/${repo}`;
  const repoOwnerLogin = repoData && repoData.owner && repoData.owner.login ? repoData.owner.login : owner;
  const topics = topicsData && (topicsData.names || topicsData.topics)
    ? (topicsData.names || topicsData.topics)
    : [];

  const TOPIC_LIMIT = 8;
  const topicPills = Array.isArray(topics) && topics.length
    ? topics.slice(0, TOPIC_LIMIT)
    : [];

  const pillsHtml = topicPills.length
    ? `<div class="flex flex-wrap gap-2 mb-6">\n${topicPills.map(t => `  <span class="pill">${escapeHtml(t)}</span>`).join('\n')}\n</div>`
    : '';

  const cardHtml = `
<div class="iris-border card p-8 flex flex-col justify-between">
  <div>
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">${escapeHtml(repoOwnerLogin)} · Repository</div>
    <h3 style="font-size:26px;font-weight:700;letter-spacing:-0.5px;margin-bottom:16px">${escapeHtml(repoName)}</h3>
    <p style="font-size:13px;color:var(--muted);line-height:1.9;margin-bottom:20px">
      ${escapeHtml(repoDescription)}
    </p>${pillsHtml ? `\n${pillsHtml}` : ''}
  </div>
  <a href="${escapeHtml(repoHtmlUrl)}" target="_blank" rel="noopener noreferrer" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:6px;margin-top:24px;text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='#a890f8'" onmouseout="this.style.color='var(--muted)'">
    View on GitHub →
  </a>
</div>
`.trim();

  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const startIndex = html.indexOf(START_TOKEN);
  const endIndex = html.indexOf(END_TOKEN);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error('Could not find AUTO_PROJECTS_START/AUTO_PROJECTS_END markers in index.html.');
  }

  const startLineEnd = html.indexOf('\n', startIndex);
  const endLineStart = html.lastIndexOf('\n', endIndex - 1) + 1;

  const sectionStart = startLineEnd === -1 ? startIndex + START_TOKEN.length : startLineEnd + 1;
  const sectionEnd = endIndex === -1 ? endIndex : endLineStart;
  const section = html.slice(sectionStart, sectionEnd);
  const dedupeNeedle = `<!-- auto-project: ${ownerRepoKey} -->`;
  if (section.includes(dedupeNeedle)) {
    // eslint-disable-next-line no-console
    console.log(`Already added: ${ownerRepoKey}`);
    return;
  }

  const startLineStart = html.lastIndexOf('\n', startIndex - 1) + 1;
  const indent = html.slice(startLineStart, startIndex); // leading whitespace before `<!--`
  const cardIndented = indentMultiline(cardHtml, indent);
  const snippet = `${indent}<!-- auto-project: ${ownerRepoKey} -->\n${cardIndented}\n`;
  const joiner = section.endsWith('\n') || section === '' ? '' : '\n';
  const newSection = `${section}${joiner}${snippet}`;

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`${START_TOKEN}\n${newSection}${END_TOKEN}`);
    return;
  }

  // Inject only between the marker lines to preserve indentation of both markers.
  const before = html.slice(0, sectionStart);
  const after = html.slice(sectionEnd);
  const newHtml = `${before}${newSection}${after}`;
  fs.writeFileSync(INDEX_PATH, newHtml, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Added: ${ownerRepoKey}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

