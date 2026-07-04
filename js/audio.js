/* =========================================================
   PLOOPI AUDIO ENGINE
   All sound is generated procedurally with the Web Audio API,
   so the game needs zero external audio files and works fully
   offline the moment the page is cached by the service worker.
   Spoken lines (welcome greeting, reward words) use the
   browser's built-in SpeechSynthesis when available.
   ========================================================= */

const PloopiAudio = (() => {
  let ctx = null;
  let musicEnabled = true;
  let soundEnabled = true;
  let musicNodes = null;
  let unlocked = false;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ensureCtx();
  }

  function blip({ freq = 440, duration = 0.15, type = "sine", gain = 0.18, glideTo = null }) {
    if (!soundEnabled) return;
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + duration);
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
  }

  function tap() { blip({ freq: 520, duration: 0.09, type: "sine", gain: 0.14 }); }
  function correct() {
    blip({ freq: 523.25, duration: 0.12, gain: 0.16 });
    setTimeout(() => blip({ freq: 659.25, duration: 0.12, gain: 0.16 }), 90);
    setTimeout(() => blip({ freq: 784.0, duration: 0.18, gain: 0.18 }), 180);
  }
  function wrong() {
    blip({ freq: 220, duration: 0.18, type: "triangle", gain: 0.14, glideTo: 160 });
  }
  function pop() {
    blip({ freq: 300, duration: 0.1, type: "square", gain: 0.12, glideTo: 700 });
  }
  function celebrate() {
    [523.25, 659.25, 784.0, 1046.5].forEach((f, i) => {
      setTimeout(() => blip({ freq: f, duration: 0.22, gain: 0.17 }), i * 110);
    });
  }
  function whoosh() {
    blip({ freq: 180, duration: 0.25, type: "sawtooth", gain: 0.08, glideTo: 380 });
  }

  // gentle ambient background loop: soft arpeggio pad, very quiet
  let musicTimer = null;
  const musicScale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3];
  function startMusic() {
    if (!musicEnabled) return;
    stopMusic(false);
    const c = ensureCtx();
    let i = 0;
    const step = () => {
      if (!musicEnabled) return;
      const freq = musicScale[i % musicScale.length];
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(0.045, c.currentTime + 0.3);
      g.gain.linearRampToValueAtTime(0, c.currentTime + 1.6);
      osc.connect(g).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 1.7);
      i++;
      musicTimer = setTimeout(step, 900);
    };
    step();
  }
  function stopMusic(clearFlagOnly) {
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
  }

  function speak(text, lang) {
    if (!soundEnabled) return;
    if (!("speechSynthesis" in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "en" ? "en-US" : "id-ID";
      utter.pitch = 1.3;
      utter.rate = 0.95;
      utter.volume = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) { /* silent fail is fine for a toy app */ }
  }

  return {
    unlock,
    setMusicEnabled(v) { musicEnabled = v; if (v) startMusic(); else stopMusic(); },
    setSoundEnabled(v) { soundEnabled = v; },
    startMusic, stopMusic,
    tap, correct, wrong, pop, celebrate, whoosh, speak
  };
})();
