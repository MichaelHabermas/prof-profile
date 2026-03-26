import { KNOWLEDGE_BASE } from './knowledge-base.js';

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function buildIndex(docs) {
  const tf = docs.map((doc) => {
    const tokens = tokenize(doc);
    const freq = {};
    tokens.forEach((t) => {
      freq[t] = (freq[t] || 0) + 1;
    });
    const total = tokens.length || 1;
    Object.keys(freq).forEach((k) => {
      freq[k] /= total;
    });
    return freq;
  });
  const df = {};
  tf.forEach((freq) =>
    Object.keys(freq).forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    })
  );
  const N = docs.length;
  const idf = {};
  Object.keys(df).forEach((t) => {
    idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1;
  });
  return { tf, idf };
}

function score(query, docTf, idf) {
  const tokens = tokenize(query);
  return tokens.reduce((s, t) => s + (docTf[t] || 0) * (idf[t] || 0), 0);
}

const idx = buildIndex(KNOWLEDGE_BASE);

export function retrieve(query, k = 4) {
  const scores = idx.tf.map((tf, i) => ({ i, s: score(query, tf, idx.idf) }));
  scores.sort((a, b) => b.s - a.s);
  return scores
    .slice(0, k)
    .filter((x) => x.s > 0)
    .map((x) => KNOWLEDGE_BASE[x.i]);
}
