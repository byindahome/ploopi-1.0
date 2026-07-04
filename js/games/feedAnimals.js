/* =========================================================
   FEED THE ANIMALS — 100 rounds
   A hungry animal appears; the child taps the food it likes.
   ========================================================= */

(function () {
  const DATA = PLOOPI_DATA_FEED_ANIMALS.rounds; // 100 entries
  let stage, ctx, currentRound;

  function nextRoundIndex() {
    const last = PloopiStorage.get().lastRound.feedAnimals;
    return (last + 1) % DATA.length;
  }

  function render(idx) {
    stage.innerHTML = "";
    currentRound = DATA[idx];
    PloopiStorage.setLastRound("feedAnimals", idx);

    const prompt = document.createElement("div");
    prompt.className = "game-prompt";
    prompt.textContent = PloopiI18n.t("feedMe");
    stage.appendChild(prompt);

    const target = document.createElement("div");
    target.className = "game-target-box bounce-slow";
    target.style.background = "#FFF3D6";
    target.textContent = currentRound.animal;
    stage.appendChild(target);

    const row = document.createElement("div");
    row.className = "options-row";
    currentRound.options.forEach(food => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = food;
      btn.addEventListener("click", () => handlePick(btn, food));
      row.appendChild(btn);
    });
    stage.appendChild(row);
  }

  function handlePick(btn, food) {
    if (btn.disabled) return;
    if (food === currentRound.correctFood) {
      document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
      btn.classList.add("correct-flash");
      PloopiAudio.correct();
      ctx.onStar();
      PloopiShowReward({
        onDone: () => render(nextRoundIndex())
      });
    } else {
      btn.classList.add("wrong-flash");
      PloopiAudio.wrong();
      setTimeout(() => btn.classList.remove("wrong-flash"), 500);
    }
  }

  window.PloopiGames = window.PloopiGames || {};
  window.PloopiGames.feedAnimals = {
    emoji: "🐮",
    titleKey: "gameFeedAnimals",
    start(stageEl, gameCtx) {
      stage = stageEl; ctx = gameCtx;
      render(nextRoundIndex());
    },
    stop() {}
  };
})();
