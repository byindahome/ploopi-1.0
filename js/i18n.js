/* =========================================================
   PLOOPI I18N
   Scalable localization system.
   Canonical, editable dictionaries live in /locales/en.json
   and /locales/id.json. This module tries to fetch them
   (works once the project is served over http/https, e.g.
   Netlify, GitHub Pages, Vercel, or a local dev server) and
   falls back to the embedded copies below so the app never
   breaks when opened directly as a file:// document.

   Add a new language by:
   1. Creating /locales/xx.json with the same keys.
   2. Adding an entry to EMBEDDED_FALLBACK below (optional,
      but recommended so it also works offline on first run).
   3. Adding a language button in index.html + FLAGS map here.
   No game logic needs to change.
   ========================================================= */

const PloopiI18n = (() => {
  const EMBEDDED_FALLBACK = {
    id: {
      tagline: "Bermain • Belajar • Bahagia", play: "MAIN", miniGames: "Mini Games",
      settings: "Pengaturan", parents: "Orang Tua", music: "Musik", sound: "Suara",
      language: "Bahasa", resetProgress: "Hapus Progres",
      resetConfirm: "Yakin ingin menghapus semua progres permainan?", yes: "Ya", cancel: "Batal",
      developer: "Pengembang", privacyPolicy: "Kebijakan Privasi", terms: "Ketentuan Layanan",
      restorePurchase: "Pulihkan Pembelian", close: "Tutup",
      privacyBody: "Ploopi Mini Games tidak mengumpulkan data pribadi apa pun dari anak Anda. Semua progres disimpan lokal di perangkat ini.",
      termsBody: "Ploopi Mini Games Vol.1 dikembangkan oleh Indahome untuk edukasi dan hiburan anak usia dini.",
      restoreBody: "Belum ada pembelian dalam versi ini.",
      gameMatchColors: "Cocokkan Warna", gameFeedAnimals: "Beri Makan Hewan",
      gamePopBalloons: "Pecahkan Balon", gameCountFruits: "Hitung Buah",
      tapTheColor: "Sentuh warna yang sama!", feedMe: "Aku mau makan apa ya?",
      popTheColor: "Pecahkan semua balon {color}!", howManyFruits: "Ada berapa buah?",
      great: "Bagus!", awesome: "Keren!", goodJob: "Kerja Bagus!", yay: "Yay!",
      letsPlay: "Ayo Bermain!", tryAgain: "Coba lagi ya!", wellDone: "Hebat sekali!",
      colorNames: { red: "Merah", blue: "Biru", yellow: "Kuning", green: "Hijau", orange: "Jingga", purple: "Ungu", pink: "Merah Muda", brown: "Coklat", skyblue: "Biru Langit", lime: "Hijau Lemon" }
    },
    en: {
      tagline: "Play • Learn • Happy", play: "PLAY", miniGames: "Mini Games",
      settings: "Settings", parents: "Parents", music: "Music", sound: "Sound",
      language: "Language", resetProgress: "Reset Progress",
      resetConfirm: "Are you sure you want to reset all game progress?", yes: "Yes", cancel: "Cancel",
      developer: "Developer", privacyPolicy: "Privacy Policy", terms: "Terms",
      restorePurchase: "Restore Purchase", close: "Close",
      privacyBody: "Ploopi Mini Games does not collect any personal data from your child. All progress is saved locally on this device.",
      termsBody: "Ploopi Mini Games Vol.1 is developed by Indahome for early-childhood education and entertainment.",
      restoreBody: "There are no purchases in this version yet.",
      gameMatchColors: "Match Colors", gameFeedAnimals: "Feed the Animals",
      gamePopBalloons: "Pop Balloons", gameCountFruits: "Count Fruits",
      tapTheColor: "Tap the matching color!", feedMe: "What should I eat?",
      popTheColor: "Pop all the {color} balloons!", howManyFruits: "How many fruits?",
      great: "Great!", awesome: "Awesome!", goodJob: "Good Job!", yay: "Yay!",
      letsPlay: "Let's Play!", tryAgain: "Try again!", wellDone: "Well done!",
      colorNames: { red: "Red", blue: "Blue", yellow: "Yellow", green: "Green", orange: "Orange", purple: "Purple", pink: "Pink", brown: "Brown", skyblue: "Sky Blue", lime: "Lime" }
    }
  };

  const FLAGS = { id: "🇮🇩", en: "🇬🇧" };
  const GREETINGS = {
    id: "Halo! Ayo bermain!",
    en: "Hello! Let's play!"
  };

  let currentLang = "id";
  let dict = EMBEDDED_FALLBACK.id;
  const cache = {};

  async function loadLang(lang) {
    if (cache[lang]) { dict = cache[lang]; currentLang = lang; applyToDom(); return dict; }
    try {
      const res = await fetch(`locales/${lang}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error("not ok");
      const json = await res.json();
      cache[lang] = json;
      dict = json;
    } catch (e) {
      dict = EMBEDDED_FALLBACK[lang] || EMBEDDED_FALLBACK.id;
      cache[lang] = dict;
    }
    currentLang = lang;
    applyToDom();
    return dict;
  }

  function t(key, vars) {
    const parts = key.split(".");
    let val = dict;
    for (const p of parts) { val = val && val[p]; }
    if (val == null) {
      // fallback to embedded id/en direct key
      val = key;
    }
    if (typeof val === "string" && vars) {
      Object.keys(vars).forEach(k => { val = val.replace(`{${k}}`, vars[k]); });
    }
    return val;
  }

  function applyToDom() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const text = t(key);
      if (typeof text === "string") el.textContent = text;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      el.setAttribute("aria-label", t(key));
    });
    document.documentElement.setAttribute("lang", currentLang);
    document.querySelectorAll(".mini-lang-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  return {
    init(lang) { return loadLang(lang || "id"); },
    setLanguage(lang) { return loadLang(lang); },
    t,
    getLang() { return currentLang; },
    getFlag(lang) { return FLAGS[lang] || ""; },
    getGreeting(lang) { return GREETINGS[lang] || GREETINGS.id; },
    colorName(colorId) { return (dict.colorNames && dict.colorNames[colorId]) || colorId; }
  };
})();
