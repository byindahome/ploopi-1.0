/* =========================================================
   COUNT FRUITS — 100 rounds
   A scattered group of fruits appears; the child taps the
   number that matches how many fruits are shown.
   ========================================================= */

(function () {
  const DATA = PLOOPI_DATA_COUNT_FRUITS.rounds; // 100 entries
  let stage, ctx, currentRound;

  function nextRoundIndex() {
    const last = PloopiStorage.get().lastRound.countFruits;
    return (last + 1) % DATA.length;
  }

  function render(idx) {
    stage.innerHTML = "";
    currentRound = DATA[idx];
    PloopiStorage.setLastRound("countFruits", idx);

    const prompt = document.createElement("div");
    prompt.className = "game-prompt";
    prompt.textContent = PloopiI18n.t("howManyFruits");
    stage.appendChild(prompt);

    const field = document.createElement("div");
    field.className = "fruit-field";
    currentRound.positions.forEach((pos, i) => {
      const f = document.createElement("div");
      f.className = "fruit-item";
      f.textContent = currentRound.emoji;
      f.style.left = `${pos.x * 100}%`;
      f.style.top = `${pos.y * 100}%`;
      f.style.transform = `rotate(${pos.rot}deg)`;
      f.style.animationDelay = `${i * 0.05}s`;
      field.appendChild(f);
    });
    stage.appendChild(field);

    const row = document.createElement("div");
    row.className = "options-row";
    currentRound.options.forEach(num => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = String(num);
      btn.style.fontFamily = "var(--font-display)";
      btn.addEventListener("click", () => handlePick(btn, num));
      row.appendChild(btn);
    });
    stage.appendChild(row);
  }

  function handlePick(btn, num) {
    if (btn.disabled) return;
    if (num === currentRound.count) {
      document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
      btn.classList.add("correct-flash");
      PloopiAudio.correct();
      ctx.onStar();
      PloopiShowReward({ onDone: () => render(nextRoundIndex()) });
    } else {
      btn.classList.add("wrong-flash");
      PloopiAudio.wrong();
      setTimeout(() => btn.classList.remove("wrong-flash"), 500);
    }
  }

  window.PloopiGames = window.PloopiGames || {};
  window.PloopiGames.countFruits = {
    emoji: "🍎",
    titleKey: "gameCountFruits",
    start(stageEl, gameCtx) {
      stage = stageEl; ctx = gameCtx;
      render(nextRoundIndex());
    },
    stop() {}
  };
})();
