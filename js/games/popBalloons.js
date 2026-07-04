/* =========================================================
   POP BALLOONS — 100 rounds
   Balloons of mixed colors float up from the bottom. The
   child taps every balloon matching the target color. Popping
   any balloon feels fun (no "wrong" penalty), but only the
   matching color counts toward finishing the round — this
   keeps the experience celebratory rather than test-like.
   ========================================================= */

(function () {
  const DATA = PLOOPI_DATA_POP_BALLOONS.rounds; // 100 entries
  let stage, ctx, currentRound, spawnTimers = [], poppedTarget = 0, field;

  function nextRoundIndex() {
    const last = PloopiStorage.get().lastRound.popBalloons;
    return (last + 1) % DATA.length;
  }

  function clearTimers() {
    spawnTimers.forEach(t => clearTimeout(t));
    spawnTimers = [];
  }

  function render(idx) {
    clearTimers();
    stage.innerHTML = "";
    poppedTarget = 0;
    currentRound = DATA[idx];
    PloopiStorage.setLastRound("popBalloons", idx);

    const prompt = document.createElement("div");
    prompt.className = "game-prompt";
    prompt.textContent = PloopiI18n.t("popTheColor", { color: PloopiI18n.colorName(currentRound.targetColorId) });
    stage.appendChild(prompt);

    const legend = document.createElement("div");
    legend.className = "game-target-box";
    legend.style.background = currentRound.targetHex;
    legend.style.width = "60px";
    legend.style.height = "60px";
    legend.style.marginBottom = "8px";
    stage.appendChild(legend);

    field = document.createElement("div");
    field.className = "balloon-field";
    stage.appendChild(field);

    currentRound.balloons.forEach(b => {
      const t = setTimeout(() => spawnBalloon(b), b.delay * 1000);
      spawnTimers.push(t);
    });
  }

  function spawnBalloon(b) {
    if (!field || !field.isConnected) return;
    const el = document.createElement("div");
    el.className = "balloon floating";
    el.style.background = b.hex;
    el.style.left = `${b.x * 100}%`;
    el.style.animationDuration = `${b.duration}s`;
    el.style.setProperty("--drift", `${(Math.random() * 60 - 30)}px`);
    el.addEventListener("click", () => popBalloon(el, b));
    el.addEventListener("animationend", () => { if (el.isConnected) el.remove(); });
    field.appendChild(el);
  }

  function popBalloon(el, b) {
    if (el.dataset.popped) return;
    el.dataset.popped = "1";
    el.classList.remove("floating");
    el.classList.add("popped");
    PloopiAudio.pop();
    if (b.colorId === currentRound.targetColorId) {
      poppedTarget++;
      if (poppedTarget >= currentRound.targetCount) {
        clearTimers();
        ctx.onStar();
        setTimeout(() => {
          PloopiShowReward({ onDone: () => render(nextRoundIndex()) });
        }, 250);
      }
    }
    setTimeout(() => { if (el.isConnected) el.remove(); }, 400);
  }

  window.PloopiGames = window.PloopiGames || {};
  window.PloopiGames.popBalloons = {
    emoji: "🎈",
    titleKey: "gamePopBalloons",
    start(stageEl, gameCtx) {
      stage = stageEl; ctx = gameCtx;
      render(nextRoundIndex());
    },
    stop() { clearTimers(); }
  };
})();
