import { initScrollReveal } from './scroll-reveal.js';
import { initIrisTide } from './iris-tide.js';
import { initNavSectionSync } from './nav-section-sync.js';
import { initHeroSpecular } from './hero-specular.js';
import { initAttentionChatSuggestions } from './chat/attention-suggestions.js';
import { initChatApp } from './chat/chat-app.js';

initScrollReveal();
initIrisTide();
const attentionChat = initAttentionChatSuggestions();
initNavSectionSync(attentionChat.onSectionChange);
initHeroSpecular();
initChatApp({ refreshAttentionSuggestions: attentionChat.refresh });
