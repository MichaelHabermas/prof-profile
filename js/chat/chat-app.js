import { retrieve } from './retriever.js';

const CHAT_API_URL = '/.netlify/functions/chat';
const POLLINATIONS_URL = 'https://text.pollinations.ai/';

export function initChatApp() {
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const msgs = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const closeBtn = document.getElementById('chat-close');
  const suggestions = document.getElementById('chat-suggestions');

  let isOpen = false;
  let busy = false;

  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    setTimeout(() => input.focus(), 260);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
  }

  fab.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
  closeBtn.addEventListener('click', closePanel);

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

  async function requestChat(payload) {
    // Primary path for deployed site (and local `netlify dev`).
    const proxiedRes = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Local static servers do not run Netlify Functions and often return 404/405.
    if (proxiedRes.status === 404 || proxiedRes.status === 405) {
      return fetch(POLLINATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    return proxiedRes;
  }

  async function sendMessage() {
    const q = input.value.trim();
    if (!q || busy) return;

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
      const res = await requestChat({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: q },
        ],
        model: 'openai',
        private: true,
        seed: -1,
      });

      if (!res.ok) {
        thinkingDiv.textContent = `Error ${res.status} — please try again.`;
      } else {
        const text = await res.text();
        thinkingDiv.textContent = text.trim() || '(no response)';
      }
    } catch {
      thinkingDiv.textContent = 'Network error — check your connection.';
    }

    thinkingDiv.classList.remove('typing');
    msgs.scrollTop = msgs.scrollHeight;
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
