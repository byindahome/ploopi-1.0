/* =========================================================
   PLOOPI APP CONTROLLER
   Handles: first-launch welcome/language flow, screen
   navigation, settings, parents page, and hosting whichever
   mini-game is currently active. Individual games register
   themselves on window.PloopiGames[id] = { emoji, titleKey, start(stage, ctx), stop() }
   ========================================================= */

(function () {
  const save = PloopiStorage.get();

  const screens = {
    welcome: document.getElementById("screen-welcome"),
    home: document.getElementById("screen-home"),
    minigames: document.getElementById("screen-minigames"),
    settings: document.getElementById("screen-settings"),
    parents: document.getElementById("screen-parents"),
    game: document.getElementById("screen-game")
  };

  let activeGameId = null;

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add("hidden"));
    screens[name].classList.remove("hidden");
  }

  function playTapSound() { PloopiAudio.unlock(); PloopiAudio.tap(); }

  // ---------- REWARD OVERLAY ----------
  const rewardOverlay = document.getElementById("reward-overlay");
  const rewardEmoji = document.getElementById("reward-emoji");
  const rewardText = document.getElementById("reward-text");
  const REWARD_WORDS = ["great", "awesome", "goodJob", "yay", "wellDone"];
  const REWARD_EMOJI = ["🌟", "🎉", "✨", "🏆", "🥳", "🌈"];

  window.PloopiShowReward = function (opts = {}) {
    PloopiAudio.celebrate();
    rewardEmoji.textContent = opts.emoji || REWARD_EMOJI[Math.floor(Math.random() * REWARD_EMOJI.length)];
    rewardText.textContent = PloopiI18n.t(opts.key || REWARD_WORDS[Math.floor(Math.random() * REWARD_WORDS.length)]);
    rewardOverlay.classList.remove("hidden");
    setTimeout(() => {
      rewardOverlay.classList.add("hidden");
      if (opts.onDone) opts.onDone();
    }, opts.duration || 1100);
  };

  window.PloopiAddStar = function (gameId) {
    return PloopiStorage.addStar(gameId);
  };

  // ---------- WELCOME / LANGUAGE ----------
  function finishWelcome(lang) {
    PloopiAudio.unlock();
    PloopiI18n.setLanguage(lang).then(() => {
      PloopiAudio.speak(PloopiI18n.getGreeting(lang), lang);
      PloopiStorage.set({ language: lang, hasLaunched: true });
      applySettingsToUI();
      setTimeout(() => goHome(), 450);
    });
  }

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.add("tapped");
      finishWelcome(btn.dataset.lang);
    });
  });

  // ---------- HOME ----------
  function goHome() {
    showScreen("home");
  }

  document.getElementById("btn-play").addEventListener("click", () => {
    playTapSound();
    // "Play" jumps straight into the mini games menu so a child reaches
    // gameplay in at most one extra tap from Home.
    showScreen("minigames");
  });
  document.getElementById("btn-minigames").addEventListener("click", () => { playTapSound(); showScreen("minigames"); });
  document.getElementById("btn-settings").addEventListener("click", () => { playTapSound(); showScreen("settings"); });
  document.getElementById("btn-parents").addEventListener("click", () => { playTapSound(); showScreen("parents"); });

  document.getElementById("back-from-minigames").addEventListener("click", () => { playTapSound(); goHome(); });
  document.getElementById("back-from-settings").addEventListener("click", () => { playTapSound(); goHome(); });
  document.getElementById("back-from-parents").addEventListener("click", () => { playTapSound(); goHome(); });

  // ---------- MINI GAMES MENU ----------
  document.querySelectorAll(".game-card").forEach(card => {
    card.addEventListener("click", () => {
      playTapSound();
      launchGame(card.dataset.game);
    });
  });

  function launchGame(gameId) {
    const game = window.PloopiGames && window.PloopiGames[gameId];
    if (!game) { console.warn("Unknown game:", gameId); return; }
    activeGameId = gameId;
    document.getElementById("game-title-badge").textContent = game.emoji + " " + PloopiI18n.t(game.titleKey);
    document.getElementById("game-stars-count").textContent = PloopiStorage.get().stars[gameId] || 0;
    showScreen("game");
    const stage = document.getElementById("game-stage");
    stage.innerHTML = "";
    game.start(stage, {
      lang: PloopiI18n.getLang(),
      onStar: () => {
        const n = PloopiAddStar(gameId);
        document.getElementById("game-stars-count").textContent = n;
      }
    });
  }

  document.getElementById("back-from-game").addEventListener("click", () => {
    playTapSound();
    if (activeGameId && window.PloopiGames[activeGameId].stop) {
      window.PloopiGames[activeGameId].stop();
    }
    activeGameId = null;
    showScreen("minigames");
  });

  // ---------- SETTINGS ----------
  function applySettingsToUI() {
    const s = PloopiStorage.get();
    document.getElementById("toggle-music").setAttribute("aria-pressed", String(s.music));
    document.getElementById("toggle-sound").setAttribute("aria-pressed", String(s.sound));
    PloopiAudio.setMusicEnabled(s.music);
    PloopiAudio.setSoundEnabled(s.sound);
    document.querySelectorAll(".mini-lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === s.language));
  }

  document.getElementById("toggle-music").addEventListener("click", () => {
    const s = PloopiStorage.get();
    const next = !s.music;
    PloopiStorage.set({ music: next });
    applySettingsToUI();
    playTapSound();
  });
  document.getElementById("toggle-sound").addEventListener("click", () => {
    const s = PloopiStorage.get();
    const next = !s.sound;
    PloopiStorage.set({ sound: next });
    applySettingsToUI();
    if (next) playTapSound();
  });
  document.querySelectorAll(".mini-lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playTapSound();
      PloopiStorage.set({ language: btn.dataset.lang });
      PloopiI18n.setLanguage(btn.dataset.lang).then(applySettingsToUI);
    });
  });

  document.getElementById("btn-reset-progress").addEventListener("click", () => {
    playTapSound();
    const ok = window.confirm(PloopiI18n.t("resetConfirm"));
    if (ok) {
      PloopiStorage.reset();
      applySettingsToUI();
    }
  });

  // ---------- PARENTS / LEGAL MODAL ----------
  const modal = document.getElementById("modal-legal");
  const modalTitle = document.getElementById("modal-legal-title");
  const modalBody = document.getElementById("modal-legal-body");
  function openModal(titleKey, bodyKey) {
    modalTitle.textContent = PloopiI18n.t(titleKey);
    modalBody.textContent = PloopiI18n.t(bodyKey);
    modal.classList.remove("hidden");
  }
  document.getElementById("btn-privacy").addEventListener("click", () => { playTapSound(); openModal("privacyPolicy", "privacyBody"); });
  document.getElementById("btn-terms").addEventListener("click", () => { playTapSound(); openModal("terms", "termsBody"); });
  document.getElementById("btn-restore").addEventListener("click", () => { playTapSound(); openModal("restorePurchase", "restoreBody"); });
  document.getElementById("modal-legal-close").addEventListener("click", () => { playTapSound(); modal.classList.add("hidden"); });

  // ---------- BOOT ----------
  function boot() {
    const s = PloopiStorage.get();
    const lang = s.language || "id";
    PloopiI18n.init(lang).then(() => {
      applySettingsToUI();
      if (s.hasLaunched && s.language) {
        goHome();
      } else {
        showScreen("welcome");
      }
    });
  }

  boot();
})();
