# Ploopi Mini Games Vol.1

Ploopi — Play • Learn • Happy
Developer: by Indahome (Instagram: @byindahome)

This repository contains a production-ready HTML5 Phaser 3 game for toddlers.

Key features:
- Touch-first UI optimized for ages 2–5 (large buttons, simple flows).
- First-launch language selection (Bahasa Indonesia & English) with Web Speech API greeting.
- 10 mini-games (30–90s each), randomized elements, replayable.
- Offline PWA with service worker + manifest.
- LocalStorage save for settings & progress.
- Modular source (src/core, src/scenes, src/games, src/utils)
- Build scripts: npm + rollup (optional). Phaser is loaded from CDN by default; bundling via rollup is available.

Quick start (no build):
- Open index.html in a browser (or host the folder on any static hosting).

Dev workflow (recommended):
- npm install
- npm run dev (if using vite) or npm run build then serve dist/

Notes:
- Replace placeholder SVGs and audio files in assets/ with your final art and professional voices for a premium release.
- Localization is scalable: add new locale JSON files to /locales.

If you want, I can:
- Produce a single downloadable ZIP package ready for upload.
- Export a high-resolution spritesheet / optimized PNGs for each character and UI button.
- Generate short professional TTS MP3s for greetings (synthetic) or prepare everything to accept voiceover files for pro recording.

Enjoy — tell me if you'd like the ZIP or further asset polishing (voiceovers, high-res art, or alternate color palette).
