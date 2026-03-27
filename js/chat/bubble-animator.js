const BASE_POSE = {
  '--bubble-shift-x': '0px',
  '--bubble-shift-y': '0px',
  '--bubble-rotate': '-5deg',
  '--bubble-scale-x': '1',
  '--bubble-scale-y': '1',
  '--bubble-opacity': '1',
  '--bubble-blur': '0px',
  '--bubble-brightness': '1',
  '--eye-scale-x': '1',
  '--eye-scale-y': '1',
  '--eye-shift-y': '0px',
  '--mouth-scale-x': '1',
  '--mouth-scale-y': '1',
  '--mouth-shift-y': '0px',
  '--tongue-shift-x': '0px',
  '--tongue-shift-y': '2px',
  '--tongue-rotate': '0deg',
  '--tongue-scale-x': '1',
  '--tongue-scale-y': '1',
  '--tongue-tip-scale': '1',
  '--teeth-top-shift': '0px',
  '--teeth-bottom-shift': '0px',
  '--gloss-shift-y': '0px',
};

const POSES = {
  idle: BASE_POSE,
  hover: {
    ...BASE_POSE,
    '--bubble-rotate': '-8deg',
    '--bubble-scale-x': '1.04',
    '--bubble-scale-y': '0.96',
    '--eye-scale-x': '1.12',
    '--eye-scale-y': '0.92',
    '--mouth-scale-x': '1.1',
    '--mouth-scale-y': '0.92',
    '--mouth-shift-y': '-1px',
    '--tongue-shift-x': '7px',
    '--tongue-shift-y': '8px',
    '--tongue-rotate': '20deg',
    '--tongue-scale-x': '0.96',
    '--tongue-scale-y': '1.06',
    '--tongue-tip-scale': '1.08',
    '--gloss-shift-y': '-1px',
  },
  click: {
    ...BASE_POSE,
    '--bubble-rotate': '8deg',
    '--bubble-scale-x': '1.16',
    '--bubble-scale-y': '0.82',
    '--eye-scale-x': '0.9',
    '--eye-scale-y': '1.08',
    '--mouth-scale-x': '1.18',
    '--mouth-scale-y': '1.2',
    '--mouth-shift-y': '2px',
    '--tongue-shift-x': '14px',
    '--tongue-shift-y': '14px',
    '--tongue-rotate': '28deg',
    '--tongue-scale-x': '1.08',
    '--tongue-scale-y': '1.24',
    '--tongue-tip-scale': '1.12',
    '--teeth-top-shift': '1px',
    '--teeth-bottom-shift': '-1px',
  },
  open: {
    ...BASE_POSE,
    '--bubble-shift-x': '-22px',
    '--bubble-shift-y': '-78px',
    '--bubble-rotate': '-18deg',
    '--bubble-scale-x': '0.68',
    '--bubble-scale-y': '0.74',
    '--bubble-opacity': '0.26',
    '--bubble-brightness': '1.04',
    '--eye-scale-x': '0.88',
    '--eye-scale-y': '1.02',
    '--mouth-scale-x': '0.88',
    '--mouth-scale-y': '0.82',
    '--tongue-shift-x': '5px',
    '--tongue-shift-y': '2px',
    '--tongue-rotate': '8deg',
    '--tongue-scale-x': '0.9',
    '--tongue-scale-y': '0.86',
    '--tongue-tip-scale': '0.92',
    '--gloss-shift-y': '1px',
  },
  listening: {
    ...BASE_POSE,
    '--bubble-shift-x': '-22px',
    '--bubble-shift-y': '-78px',
    '--bubble-rotate': '-16deg',
    '--bubble-scale-x': '0.72',
    '--bubble-scale-y': '0.76',
    '--bubble-opacity': '0.34',
    '--bubble-brightness': '1.08',
    '--eye-scale-x': '1.02',
    '--eye-scale-y': '0.92',
    '--mouth-scale-x': '0.96',
    '--mouth-scale-y': '0.92',
    '--mouth-shift-y': '-1px',
    '--tongue-shift-x': '8px',
    '--tongue-shift-y': '8px',
    '--tongue-rotate': '14deg',
    '--tongue-scale-x': '0.96',
    '--tongue-scale-y': '1.02',
    '--tongue-tip-scale': '1.06',
  },
  close: {
    ...BASE_POSE,
    '--bubble-shift-x': '-5px',
    '--bubble-shift-y': '-20px',
    '--bubble-rotate': '-28deg',
    '--bubble-scale-x': '0.8',
    '--bubble-scale-y': '1.16',
    '--eye-scale-x': '0.92',
    '--eye-scale-y': '1.08',
    '--mouth-scale-x': '0.86',
    '--mouth-scale-y': '0.76',
    '--mouth-shift-y': '-4px',
    '--tongue-shift-x': '-8px',
    '--tongue-shift-y': '-12px',
    '--tongue-rotate': '-30deg',
    '--tongue-scale-x': '0.74',
    '--tongue-scale-y': '0.52',
    '--tongue-tip-scale': '0.8',
  },
};

const SOUND_LIBRARY = {
  hover: { asset: null, synth: playHoverSynth },
  open: { asset: null, synth: playOpenSynth },
  close: { asset: null, synth: playCloseSynth },
  toggle: { asset: null, synth: playToggleSynth },
  listening: { asset: null, synth: playListeningSynth },
};

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

class BubbleSoundController {
  constructor({ toggle, roots }) {
    this.toggle = toggle;
    this.roots = roots;
    this.enabled = false;
    this.audioContext = null;
  }

  syncUi() {
    for (const root of this.roots) {
      root.dataset.sound = this.enabled ? 'on' : 'off';
    }

    this.toggle.setAttribute('aria-pressed', String(this.enabled));
    this.toggle.setAttribute(
      'aria-label',
      this.enabled ? 'Disable chat sounds' : 'Enable chat sounds'
    );
    this.toggle.title = this.enabled ? 'Disable chat sounds' : 'Enable chat sounds';
  }

  async ensureContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;

    if (!this.audioContext) {
      this.audioContext = new AudioCtor();
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {
        return null;
      }
    }

    return this.audioContext;
  }

  async setEnabled(enabled) {
    this.enabled = enabled;
    this.syncUi();

    if (enabled) {
      await this.ensureContext();
    }

    return this.enabled;
  }

  async toggleEnabled() {
    const next = !this.enabled;
    await this.setEnabled(next);
    if (next) {
      void this.play('toggle');
    }
    return next;
  }

  async unlockFromGesture() {
    if (!this.enabled) return;
    await this.ensureContext();
  }

  async play(name) {
    if (!this.enabled) return;

    const definition = SOUND_LIBRARY[name];
    if (!definition) return;

    const ctx = await this.ensureContext();
    if (!ctx) return;

    if (definition.asset) {
      const audio = new Audio(definition.asset);
      audio.volume = 0.75;
      try {
        await audio.play();
        return;
      } catch {
        /* fall back to synth */
      }
    }

    definition.synth(ctx);
  }
}

function playHoverSynth(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(740, now);
  osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
  osc.frequency.exponentialRampToValueAtTime(820, now + 0.16);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.028, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}

function playOpenSynth(ctx) {
  const now = ctx.currentTime;
  const low = ctx.createOscillator();
  const high = ctx.createOscillator();
  const gain = ctx.createGain();

  low.type = 'square';
  low.frequency.setValueAtTime(220, now);
  low.frequency.exponentialRampToValueAtTime(126, now + 0.16);

  high.type = 'triangle';
  high.frequency.setValueAtTime(920, now + 0.01);
  high.frequency.exponentialRampToValueAtTime(410, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  low.connect(gain);
  high.connect(gain);
  gain.connect(ctx.destination);

  low.start(now);
  high.start(now + 0.01);
  low.stop(now + 0.19);
  high.stop(now + 0.14);
}

function playCloseSynth(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(420, now + 0.12);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

function playToggleSynth(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(540, now);
  osc.frequency.exponentialRampToValueAtTime(790, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.024, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

function playListeningSynth(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(510, now);
  osc.frequency.exponentialRampToValueAtTime(630, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(470, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.018, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

export function createBubbleAnimator({ fab, panel, soundToggle }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  let reducedMotion = prefersReducedMotion.matches;
  let open = false;
  let locked = false;
  let listening = false;
  let hoverTimer = 0;
  let hoverCooldownUntil = 0;
  let listeningCooldownUntil = 0;

  const sound = new BubbleSoundController({
    toggle: soundToggle,
    roots: [fab, panel],
  });
  sound.syncUi();

  function applyPose(pose) {
    const mergedPose = { ...BASE_POSE, ...pose };
    for (const [name, value] of Object.entries(mergedPose)) {
      fab.style.setProperty(name, value);
    }
  }

  function setBubbleState(state) {
    fab.dataset.bubbleState = state;
  }

  function setPanelState(state) {
    panel.dataset.panelState = state;
  }

  function syncExpanded() {
    fab.setAttribute('aria-expanded', String(open));
  }

  function resetToOpenPose() {
    setBubbleState(listening ? 'listening' : open ? 'open' : 'idle');
    applyPose(listening ? POSES.listening : open ? POSES.open : POSES.idle);
  }

  async function triggerHover() {
    if (!hoverQuery.matches || open || locked || listening) return;
    const now = performance.now();
    if (now < hoverCooldownUntil) return;

    hoverCooldownUntil = now + 680;
    window.clearTimeout(hoverTimer);
    setBubbleState('hover');
    applyPose(POSES.hover);
    void sound.play('hover');

    hoverTimer = window.setTimeout(() => {
      if (!open && !locked && !listening) {
        setBubbleState('idle');
        applyPose(POSES.idle);
      }
    }, reducedMotion ? 120 : 680);
  }

  function clearHover() {
    window.clearTimeout(hoverTimer);
    if (!open && !locked && !listening) {
      setBubbleState('idle');
      applyPose(POSES.idle);
    }
  }

  async function openPanelSequence() {
    if (locked || open) return false;

    locked = true;
    open = true;
    listening = false;
    syncExpanded();
    window.clearTimeout(hoverTimer);
    await sound.unlockFromGesture();

    setBubbleState('click');
    applyPose(POSES.click);
    void sound.play('open');

    await wait(reducedMotion ? 80 : 110);
    panel.classList.add('open');
    setPanelState('opening');

    await wait(reducedMotion ? 90 : 220);
    setBubbleState('open');
    applyPose(POSES.open);

    await wait(reducedMotion ? 70 : 170);
    setPanelState('open');
    locked = false;
    return true;
  }

  async function closePanelSequence() {
    if (locked || !open) return false;

    locked = true;
    listening = false;
    await sound.unlockFromGesture();
    setPanelState('closing');
    setBubbleState('close');
    applyPose(POSES.close);
    void sound.play('close');

    await wait(reducedMotion ? 120 : 230);
    panel.classList.remove('open');
    setPanelState('closed');
    open = false;
    syncExpanded();

    setBubbleState('idle');
    applyPose(POSES.idle);
    await wait(reducedMotion ? 60 : 120);

    locked = false;
    return true;
  }

  function setListening(active) {
    listening = active && open;

    if (listening) {
      setBubbleState('listening');
      applyPose(POSES.listening);
      const now = performance.now();
      if (now > listeningCooldownUntil) {
        listeningCooldownUntil = now + 1400;
        void sound.play('listening');
      }
    } else if (!locked) {
      resetToOpenPose();
    }
  }

  soundToggle.addEventListener('click', async (event) => {
    event.stopPropagation();
    await sound.toggleEnabled();
  });

  fab.addEventListener('pointerenter', () => {
    void triggerHover();
  });

  fab.addEventListener('pointerleave', clearHover);
  fab.addEventListener('blur', clearHover);

  const reducedMotionListener = (event) => {
    reducedMotion = event.matches;
    if (!locked) {
      resetToOpenPose();
    }
  };

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', reducedMotionListener);
  } else {
    prefersReducedMotion.addListener(reducedMotionListener);
  }

  setPanelState('closed');
  applyPose(POSES.idle);
  syncExpanded();

  return {
    isLocked: () => locked,
    isOpen: () => open,
    openPanelSequence,
    closePanelSequence,
    setListening,
  };
}
