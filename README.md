# Physics in Motion — Animated Physics Dictionary (v2)

A responsive learning platform built with React, TypeScript and Vite. Every concept pairs a live, physically grounded simulation with intuition, typeset equations, a step-by-step derivation, guided experiments, real-world applications, corrected misconceptions, and a self-check quiz.

See **REVIEW.md** for the critical review of v1 and the full list of changes.

## What is inside

- **12 concepts**: projectile motion, simple harmonic motion, orbits and Kepler's laws, wave interference and beats, the Doppler effect, refraction and total internal reflection, electromagnetic induction, the Lorentz force, the ideal gas and kinetic theory, the quantum particle in a box, single-particle double-slit interference, radioactive decay.
- **Simulation engine** (`src/sim/`): one declarative spec per simulation (parameters, presets, state, step, draw, readouts, caption). The shared `SimPlayer` supplies play/pause, speed (0.25–2×), reset, presets, live readouts, PNG export for slides, and full-screen for projecting.
- **Glossary** (43 terms, linked to concepts), **formula sheet** (all key equations, printable), search across concepts and terms (`Ctrl/⌘ + K` or `/`), bookmarks, progress, best quiz scores, light and dark themes, deep links such as `#/topic/orbits`, and print-friendly lecture notes.

## Requirements

- Windows 10/11, macOS, or Linux
- Node.js LTS (includes npm)
- Internet connection for the first dependency installation

## Run on Windows

1. Extract this folder somewhere convenient.
2. Install Node.js LTS if needed: https://nodejs.org/
3. Double-click `START_PHYSICS_DICTIONARY.bat` (it runs `npm install` on first launch).
4. The browser opens at `http://127.0.0.1:5173`. Keep the command window open; press `Ctrl+C` to stop.

## Run manually

```bash
npm install
npm run dev
```

Production build test:

```bash
npm run build
npm run preview
```

## Add a new concept (three steps)

1. **Simulation**: add a `Sim` object in `src/sim/*.ts` (copy a small one such as `doppler` in `waves.ts`) and register it in `src/sim/index.ts` under the topic id.
2. **Content**: add a `Topic` entry in the matching `src/content/*.ts` file (equations are TeX strings; use `String.raw`). Every field is required, which keeps all concepts equally complete.
3. **Glossary** (optional): add terms to `src/glossary.ts` with the topic id in `topics`.

The home page, sidebar, search, formula sheet, and counts update automatically.

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy.yml`. It builds the site and deploys `dist/` whenever you push to the `main` branch.

1. Create a public GitHub repository named `animated-physics-dictionary` under your GitHub account.
2. Upload/push all files in this folder to the repository's `main` branch.
3. In GitHub, open **Settings → Pages**. Set the publishing source to **GitHub Actions**.
4. The workflow will run under the **Actions** tab. Wait for the deployment to succeed.
5. The project is configured for the custom domain `physics.drkasuramachandran.com` (root base path `/`).

### Configure the Namecheap DNS record

In Namecheap's Advanced DNS for `drkasuramachandran.com`, add:

| Type | Host | Value |
|---|---|---|
| CNAME | `physics` | `drkasuramachandran.github.io` |

Keep any unrelated records unchanged. Do not create a wildcard DNS record. In the repository, GitHub **Settings → Pages → Custom domain**, enter `physics.drkasuramachandran.com` if it is not already populated. After DNS propagates and GitHub issues the certificate, enable **Enforce HTTPS**.

DNS changes can take up to 24 hours. If this subdomain is already used by another service, resolve that conflict before changing its record.

Official guides:
- Vite deployment: https://vite.dev/guide/static-deploy.html
- GitHub Pages custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Project structure

```text
animated-physics-dictionary/
├── .github/workflows/deploy.yml
├── src/
│   ├── App.tsx            routing, pages, shell
│   ├── SimPlayer.tsx      generic simulation player
│   ├── Quiz.tsx, Tex.tsx  quiz and KaTeX components
│   ├── data.ts            Topic type, categories, learning paths
│   ├── glossary.ts
│   ├── content/           topic text, by subject
│   ├── sim/               kit.ts (types, drawing helpers) + one file per subject
│   ├── util.ts, main.tsx, styles.css
├── REVIEW.md
├── CNAME, index.html, package.json, tsconfig*.json, vite.config.ts
└── START_PHYSICS_DICTIONARY.bat
```

## Notes

- Bookmarks, completion, quiz scores and theme are saved in the browser's local storage.
- No backend or API key is needed.
- The Google Fonts import is optional; system fonts are used offline.
- Simulations are idealised teaching models. Each concept lists its assumptions under "Model assumptions".
- Do not commit `node_modules/` or `dist/`.
