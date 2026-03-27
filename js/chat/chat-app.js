import { retrieve } from './retriever.js';
import { createBubbleAnimator } from './bubble-animator.js';

const CHAT_API_URL = '/.netlify/functions/chat';
const POLLINATIONS_URL = 'https://text.pollinations.ai/';
const DEFAULT_ASSISTANT_MESSAGE =
  "Hey! I'm Michael's AI assistant — ask me about his experience, projects, skills, or anything on his resume.";

export function initChatApp() {
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const msgs = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const closeBtn = document.getElementById('chat-close');
  const resetBtn = document.getElementById('chat-reset');
  const soundToggle = document.getElementById('chat-sound-toggle');
  const suggestions = document.getElementById('chat-suggestions');

  if (
    !fab ||
    !panel ||
    !msgs ||
    !input ||
    !sendBtn ||
    !closeBtn ||
    !resetBtn ||
    !soundToggle ||
    !suggestions
  ) {
    return;
  }

  let busy = false;
  const animator = createBubbleAnimator({ fab, panel, soundToggle });

  async function openPanel() {
    const opened = await animator.openPanelSequence();
    if (opened) {
      window.setTimeout(() => input.focus(), 260);
    }
  }

  async function closePanel() {
    await animator.closePanelSequence();
  }

  fab.addEventListener('click', () => {
    if (animator.isLocked()) return;
    void (animator.isOpen() ? closePanel() : openPanel());
  });

  closeBtn.addEventListener('click', () => {
    void closePanel();
  });

  function resetChat() {
    if (busy) return;
    msgs.innerHTML = '';
    addMsg('assistant', DEFAULT_ASSISTANT_MESSAGE);
    suggestions.style.display = 'flex';
    input.value = '';
    input.focus();
  }

  resetBtn.addEventListener('click', resetChat);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && animator.isOpen()) {
      void closePanel();
    }
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
      const isLocalHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (isLocalHost) {
        throw new Error(
          'Local server cannot run Netlify Functions. Start with `netlify dev`.'
        );
      }

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
    suggestions.style.display = 'none';

    addMsg('user', q);
    animator.setListening(true);

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
      });

      if (!res.ok) {
        thinkingDiv.textContent = `Error ${res.status} — please try again.`;
      } else {
        const text = await res.text();
        thinkingDiv.textContent = text.trim() || '(no response)';
      }
    } catch (error) {
      thinkingDiv.textContent =
        error instanceof Error
          ? error.message
          : 'Network error — check your connection.';
    }

    thinkingDiv.classList.remove('typing');
    animator.setListening(false);
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
