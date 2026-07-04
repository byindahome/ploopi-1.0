/* =========================================================
   MATCH COLORS — 100 rounds
   A big target color blob appears; the child taps the option
   swatch that matches it. Correct answers celebrate and move
   on to the next (non-repeating) round automatically.
   ========================================================= */

(function () {
  const DATA = PLOOPI_DATA_MATCH_COLORS.rounds; // 100 entries
  let stage, ctx, timer, currentRound;

  function nextRoundIndex() {
    const last = PloopiStorage.get().lastRound.matchColors;
    return (last + 1) % DATA.length;
  }

  function render(idx) {
    stage.innerHTML = "";
    currentRound = DATA[idx];
    PloopiStorage.setLastRound("matchColors", idx);

    const prompt = document.createElement("div");
    prompt.className = "game-prompt";
    prompt.textContent = PloopiI18n.t("tapTheColor");
    stage.appendChild(prompt);

    const target = document.createElement("div");
    target.className = "game-target-box";
    target.style.background = currentRound.targetHex;
    target.textContent = "🎯";
    target.style.color = "rgba(255,255,255,0.0)";
    stage.appendChild(target);

    const row = document.createElement("div");
    row.className = "options-row";
    currentRound.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.style.background = opt.hex;
      btn.setAttribute("aria-label", PloopiI18n.colorName(opt.id));
      btn.addEventListener("click", () => handlePick(btn, opt));
      row.appendChild(btn);
    });
    stage.appendChild(row);
  }

  function handlePick(btn, opt) {
    if (btn.disabled) return;
    if (opt.id === currentRound.targetId) {
      document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
      btn.classList.add("correct-flash");
      PloopiAudio.correct();
      ctx.onStar();
      PloopiShowReward({
        onDone: () => {
          const idx = nextRoundIndex();
          render(idx);
        }
      });
    } else {
      btn.classList.add("wrong-flash");
      PloopiAudio.wrong();
      setTimeout(() => btn.classList.remove("wrong-flash"), 500);
    }
  }

  window.PloopiGames = window.PloopiGames || {};
  window.PloopiGames.matchColors = {
    emoji: "🎨",
    titleKey: "gameMatchColors",
    start(stageEl, gameCtx) {
      stage = stageEl; ctx = gameCtx;
      render(nextRoundIndex());
    },
    stop() {
      if (timer) clearTimeout(timer);
    }
  };
})();
