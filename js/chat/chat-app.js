import { retrieve } from './retriever.js';

const STORAGE_KEY_API = 'mh_chat_apikey';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const CHAT_MODEL = 'gpt-4o-mini';

export function initChatApp() {
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const msgs = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const closeBtn = document.getElementById('chat-close');
  const suggestions = document.getElementById('chat-suggestions');
  const apiOverlay = document.getElementById('chat-api-overlay');
  const apiInput = document.getElementById('chat-api-input');
  const apiSave = document.getElementById('chat-api-save');
  const apiClear = document.getElementById('chat-api-clear');

  let isOpen = false;
  let busy = false;

  function getKey() {
    return localStorage.getItem(STORAGE_KEY_API) || '';
  }

  function saveKey(k) {
    localStorage.setItem(STORAGE_KEY_API, k.trim());
  }

  function showOverlay(show) {
    apiOverlay.classList.toggle('hidden', !show);
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    showOverlay(!getKey());
    if (getKey()) setTimeout(() => input.focus(), 260);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
  }

  fab.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);

  apiSave.addEventListener('click', () => {
    const k = apiInput.value.trim();
    if (!k.startsWith('sk-')) {
      apiInput.style.borderColor = '#f090c8';
      return;
    }
    saveKey(k);
    showOverlay(false);
    setTimeout(() => input.focus(), 80);
  });
  apiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') apiSave.click();
  });

  apiClear.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem(STORAGE_KEY_API);
    apiInput.value = '';
    showOverlay(true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  function addMsg(role, text) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const q = input.value.trim();
    if (!q || busy) return;
    const key = getKey();
    if (!key) {
      showOverlay(true);
      return;
    }

    busy = true;
    sendBtn.disabled = true;
    input.value = '';
    input.disabled = true;

    addMsg('user', q);

    const context = retrieve(q);
    const system = `You are a helpful assistant for Michael Habermas's portfolio. Answer questions concisely and accurately using only the provided context. Speak in third person about Michael. If the answer isn't in the context, say so briefly.\n\nContext:\n${context.join('\n\n')}`;

    const thinkingDiv = addMsg('assistant', '…');
    thinkingDiv.classList.add('typing');

    try {
      const res = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          stream: true,
          max_tokens: 300,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: q },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        thinkingDiv.textContent = `Error ${res.status}: ${err?.error?.message || 'Check your API key.'}`;
        thinkingDiv.classList.remove('typing');
      } else {
        thinkingDiv.classList.remove('typing');
        thinkingDiv.textContent = '';
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                thinkingDiv.textContent += delta;
                msgs.scrollTop = msgs.scrollHeight;
              }
            } catch {
              /* ignore malformed SSE chunks */
            }
          }
        }
      }
    } catch {
      thinkingDiv.textContent = 'Network error — check your connection.';
      thinkingDiv.classList.remove('typing');
    }

    busy = false;
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }

  suggestions.addEventListener('click', (e) => {
    const btn = e.target.closest('.chat-suggestion');
    if (!btn) return;
    input.value = btn.textContent;
    suggestions.style.display = 'none';
    sendMessage();
  });

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}
