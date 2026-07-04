/* =========================================================
   PLOOPI STORAGE
   Thin wrapper around localStorage for saving:
   - selected language
   - music/sound settings
   - stars earned per game
   - completed rounds (so replays feel fresh where possible)
   ========================================================= */

const PloopiStorage = (() => {
  const KEY = "ploopi_save_v1";

  const defaults = {
    hasLaunched: false,
    language: null, // 'id' | 'en'
    music: true,
    sound: true,
    stars: {
      matchColors: 0,
      feedAnimals: 0,
      popBalloons: 0,
      countFruits: 0
    },
    lastRound: {
      matchColors: -1,
      feedAnimals: -1,
      popBalloons: -1,
      countFruits: -1
    }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults, stars: { ...defaults.stars }, lastRound: { ...defaults.lastRound } };
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        stars: { ...defaults.stars, ...(parsed.stars || {}) },
        lastRound: { ...defaults.lastRound, ...(parsed.lastRound || {}) }
      };
    } catch (e) {
      console.warn("PloopiStorage: failed to read save, using defaults.", e);
      return { ...defaults, stars: { ...defaults.stars }, lastRound: { ...defaults.lastRound } };
    }
  }

  let state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("PloopiStorage: failed to save.", e);
    }
  }

  return {
    get() { return state; },
    set(patch) {
      state = { ...state, ...patch };
      save();
      return state;
    },
    addStar(gameId) {
      state.stars[gameId] = (state.stars[gameId] || 0) + 1;
      save();
      return state.stars[gameId];
    },
    setLastRound(gameId, roundIndex) {
      state.lastRound[gameId] = roundIndex;
      save();
    },
    reset() {
      state = { ...defaults, hasLaunched: state.hasLaunched, language: state.language, stars: { ...defaults.stars }, lastRound: { ...defaults.lastRound } };
      save();
      return state;
    }
  };
})();
