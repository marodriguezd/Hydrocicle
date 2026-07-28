# AGENTS.md — HydroCycle

> Static rules file for AI coding assistants. Read this **before** touching the codebase.
> HydroCycle is an immersive PWA for guided contrast therapy (hot/cold shower intervals) and cold exposure training.
> Living knowledge (long-term memory, progress, architecture maps) lives in [`.agents/`](.agents/) — see the index in [`especificaciones.md`](.agents/especificaciones.md).
> Nota: los ficheros dentro de `.agents/` están en **español** (mismo patrón que `README.md` + `README.es.md`). `AGENTS.md` queda en inglés para portabilidad con otros proyectos.

## 📚 Knowledge base — `.agents/`

`AGENTS.md` is for **static rules**. The `.agents/` directory (en español) is the agent's persistent workspace — long-term scratch pad, not ephemeral state. **Update `.agents/` after every meaningful session.**

| Fichero | Propósito |
|---|---|
| [`.agents/especificaciones.md`](.agents/especificaciones.md) | Índice / TOC — empieza por aquí si dudas qué leer. |
| [`.agents/especificacion.md`](.agents/especificacion.md) | Especificación funcional: requisitos, contratos de UI/audio/PWA, localización. |
| [`.agents/arquitectura.md`](.agents/arquitectura.md) | Mapa técnico: capas, contextos, máquina de estados, build, audio, persistencia. |
| [`.agents/memoria.md`](.agents/memoria.md) | Hechos persistentes, decisiones de diseño, gotchas — lo aprendido sesión tras sesión. |
| [`.agents/progreso.md`](.agents/progreso.md) | Estado de tareas: en curso, pendientes, hecho recientemente, deuda técnica. |

> Si no sabes dónde anotar algo, casi siempre va en `.agents/memoria.md`.

---

## 1. Project Summary

- **Name:** HydroCycle (folder is `Hydrocicle`; PWA id and base path use the canonical spelling).
- **Type:** Single-page Progressive Web App, mobile-first, designed to feel like a native shower timer.
- **Purpose:** Guides the user through alternating hot/cold phases with timing, audio cues, vibration, and a pulsating hexagon visualizer. Tracks streaks and history offline.
- **Sibling project:** Part of the same wellness ecosystem as `Bubble-Breathing` — conventions are mirrored; if you ever cross-reference, keep glassmorphism/UX style consistent.
- **Architecture:** Frontend-only React app, no backend. Persistence is 100% `localStorage`. Sound is synthesized at runtime via the **Web Audio API** (no audio files for cues).
- **Screens (state machine):** `idle` → `hot` → `cold` → `hot` → `cold` … → `finished` (alternates `rounds` times), with `stats` reachable from `idle`. Driven by `SessionPhase` in `SessionContext`.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript 5.8 (`~5.8.2`) | Strict, no `strict` flag in tsconfig but types are real. |
| UI | React `^19.0.0` | Function components only. `StrictMode` is on in `main.tsx`. |
| Build | Vite `^6.2.0` + `@vitejs/plugin-react` | `base: '/Hydrocicle/'` for GitHub Pages. |
| PWA | `vite-plugin-pwa` `^0.21.1`, `registerType: 'autoUpdate'` | Aggressive update on focus + every 30 min. |
| Icons | `lucide-react` `^0.546.0` | **Use lucide, never emojis, for UI icons** (the README's 🥶/💧/⏱️ markers are documentation only — the app UI already swapped to `Snowflake / Droplet / Timer`). |
| Audio | Web Audio API (synthesized for cues) | `playTone(freq, ms, volume, type)` helper. Ambient soundscapes use `.mp3` files in `public/assets/` — see §4.4. |
| Typography | Google Fonts (`Outfit`) | Loaded via `<link>` in `index.html`. Do not add other web fonts without a reason. |
| Persistence | `localStorage` (keys: `hydrocicleConfig`, `hydrocicleHistory`) | Version migrations are not implemented — keep schemas additive. |
| Styling | Hand-written CSS3 in `src/index.css` | Custom properties, glassmorphism, `clamp()`, `dvh`, `vmin`. **Do not** introduce Tailwind/CSS-in-JS. |
| Package manager | Bun (lockfile present + used in CI) | `npm`/`pnpm` work locally, but mirror `bun.lock`. |
| CI/CD | GitHub Actions → GitHub Pages (`/.github/workflows/deploy.yml`) | Builds on push to `main`. |

---

## 3. Frequent Commands

```bash
# Install (Bun preferred to keep parity with CI)
bun install         # or: npm install

# Dev server (HMR on by default; set DISABLE_HMR=true to disable)
bun run dev         # or: npm run dev

# Production build (tsc -b then vite build)
bun run build       # outputs ./dist

# Preview the production build locally
bun run preview     # or: npm run preview

# Type-check only (matches the build pipeline; tsconfig already has noEmit:true)
bunx tsc -b        # or: npm run build  (which runs `tsc -b && vite build`)
```

> ⚠️ There is **no test runner, no linter, and no formatter configured**. Do not invent ESLint/Prettier/Jest configs without asking the user first. `tsc` is the only enforced check.
> ⚠️ The typecheck command below assumes dependencies are installed (`bun install` or `npm install`). Avoid bare `npx tsc` — it can resolve to the unrelated `tsc@2.0.4` package. Prefer `bunx`/`npm run build` (which runs `tsc -b && vite build`).

---

## 4. Code Conventions & Structure

### 4.1 Folder layout

```
src/
├── App.tsx                  # Provider tree + screen router
├── main.tsx                 # Service-worker registration, createRoot
├── index.css                # All global + component styles (single file)
├── translations.js          # window.translations = { lang: { key: '...' } }
├── contexts/                # React Context API state (one per domain)
│   ├── SettingsContext.tsx
│   ├── SessionContext.tsx
│   ├── TimerContext.tsx
│   └── HistoryContext.tsx
├── components/              # One file per screen (PascalCase)
│   ├── ConfigScreen.tsx
│   ├── ShowerScreen.tsx
│   ├── ResultsScreen.tsx
│   ├── StatsScreen.tsx
│   ├── SoundscapeManager.tsx
│   └── Header.tsx
├── hooks/
│   └── useTranslation.ts    # The only custom hook
└── utils/
    └── timeFormat.ts
```

### 4.2 Naming & typing

- **Components:** PascalCase, named exports (`export const Header = () => …`). No default exports except `App.tsx`.
- **Hooks:** `useX` snake-case-of-domain — `useSettings`, `useSession`, `useTimer`, `useHistory`, `useTranslation`.
- **Context providers:** `XProvider` paired with `useX` that **throws** if used outside its provider (see e.g. `useSettings` pattern in `SettingsContext.tsx`).
- **Variables/functions:** `camelCase`. Types/interfaces: `PascalCase`.
- **Unions for state:** prefer string-literal unions (e.g. `SessionPhase = 'idle' | 'hot' | 'cold' | 'finished' | 'stats'`).
- **Imports:** Use the `@/` alias (maps to project root). Relative imports (`../contexts/...`) are fine and currently predominant — keep style consistent within the file you edit.
- **`translations.js`** is intentionally `.js` (not `.ts`) because it sets `window.translations` at import time; keep that contract.

### 4.3 State management rules

- All cross-component state lives in **one of four contexts**. Components should not hold shared state in their own `useState`.
- The provider order in `App.tsx` is intentional and load-bearing:
  ```
  SettingsProvider → SessionProvider → HistoryProvider → TimerProvider
  ```
  `TimerProvider` consumes both `Settings` and `Session` — do **not** reorder.
- `useEffect` persistence: settings save on every `config` change; history saves on every `history` change. Adding a new persisted slice should follow the same pattern.
- Refs (`useRef`) are used to break dependency cycles inside `TimerContext` (`secondsInPhaseRef`, `currentRoundResultsRef`). When adding timer internals, prefer refs + `useCallback` over spreading state into effect deps.

### 4.4 Audio & haptics

Two distinct audio concerns — don't conflate them:

**A. Timer/alert cues — synthesized (no asset files).** Use `playTone(frequency, durationMs, volume, oscillatorType)` exported from `TimerContext.tsx`. Patterns that exist today and should be preserved:
- **Transition siren:** square wave at 880 Hz then 704 Hz.
- **Completion fanfare:** sine arpeggio C5→E5→G5→C6.
- **5-second countdown beep:** D5 sine, 150 ms.

**B. Ambient soundscapes — `.mp3` files in `public/assets/`.** Resolved at runtime by `SoundscapeManager` / `ConfigScreen` as `${import.meta.env.BASE_URL || '/'}assets/${config.soundscape}.mp3`. Existing tracks: `rain.mp3`, `ocean.mp3`, `wind.mp3` (set `config.soundscape === 'none'` to disable). To add a new ambient track, drop the `.mp3` in `public/assets/`, add a `soundscape_<key>` translation entry in all 7 locales, and update the grid in `ConfigScreen.tsx` + `translations.js`.

- `vibrate(pattern)` is wrapped in a try/catch and silently no-ops on unsupported devices.
- Always ramp gain with `setValueAtTime` + `exponentialRampToValueAtTime` to avoid clicks.
- No external audio library exists today — keep it that way.

### 4.5 Translation system

- Translations live on `window.translations`, set as a **side-effect import** of `./translations.js` at the top of `App.tsx`.
- `useTranslation()` returns `{ t, language }`. `t(key, { placeholders })` supports `{name}` interpolation (single brace, not double).
- Every translatable string must exist in **all 7 languages** (`en, es, fr, it, de, pt, zh`). If you add a key, add it to every block — the fallback only falls back to the English key text, not to another locale.
- For soundscape names, the keys follow the `soundscape_*` convention (e.g. `soundscape_rain`).

### 4.6 Styling conventions (UI/UX)

- All styles live in `src/index.css`. Class names are kebab-case (`.hexagon-container`, `.stats-card`).
- Theme tokens are CSS custom properties on `:root`, overridden by `html[data-theme="light"]`. Always add new theme variables to both blocks.
- Always use `clamp()` for type sizes and the existing spacing scale (`0.5rem / 1rem / 1.25rem / 1.5rem / 2rem`).
- Mobile-first; the layout is fixed at `max-width: 480px`. At `min-width: 768px` the `.container` also gains `height: 90dvh` and `border-radius: 2rem` — do not back-port those to mobile.
- Body-level centering (`flex` on `body`) positions the mobile-sized card on larger screens.
- Honour safe areas: use `env(safe-area-inset-top/bottom)` anywhere chrome can collide with iOS notches.
- Animations must be GPU-friendly (`transform`/`opacity`) — avoid animating layout properties.
- **Icons:** import from `lucide-react`, never substitute emojis. The history list in `StatsScreen.tsx` and the phase icons in `ShowerScreen.tsx` already use lucide — preserve that.

### 4.7 Error handling & logging

- `try/catch` around JSON parsing of `localStorage` is mandatory (see `SettingsContext.tsx`); recover to defaults instead of crashing.
- Audio/vibration failures log via `console.warn` (never `console.error`) — they're user-environment limitations, not bugs.
- Service Worker registration errors use `console.error` (see `main.tsx`).

---

## 5. Rules for AI Agents

### 🚫 Avoid

- **No new dependencies** without explicit user approval. Lints/test runners/UI kits/SSR — all out of scope.
- **No CSS frameworks** (Tailwind, styled-components, Emotion, CSS Modules). Extend `index.css`.
- **No additional state libraries** (Zustand, Redux, Jotai). React Context is the project choice.
- **No emoji glyphs** in UI. Use `lucide-react`. The only emoji used in shipped code are country flags inside the language dropdown (and that's via the flag strings in `Header.tsx`, not literals scattered through screens).
- **No external icon libraries** besides `lucide-react`.
- **No emoji icons in copy**: README examples showing 🥶/💧/⏱️ are documentation; do not bring them into the app UI.
- **No backend, no API calls.** `metadata.json` and `.env.example` (containing `GEMINI_API_KEY` / `APP_URL`) are vestigial artifacts from an upstream AI Studio fork and are unused by this app — do not wire them in or import them.
- **Do not rename** public paths/icons. `vite.config.ts` ships with `base: '/Hydrocicle/'` and `manifest` references to `public/assets/icon.svg` and `icon-monochrome.svg` — keep them or update both together.
- **Do not introduce a test runner** silently; ask first.
- **Do not reorder providers** in `App.tsx`; `TimerProvider` depends on the others.
- **Do not change `translations.js` to `.ts`** — it intentionally sets a global at import time.
- **Do not bundle audio files** for timers/alerts/countdown beeps. Use `playTone`.
- **Do not break offline-first behaviour.** Any new network fetch must be optional and degrade gracefully.

### ✅ Do

- Reuse the **four contexts** and **the `useTranslation` hook** before adding new state mechanics.
- When adding a string, add it to **all 7 locales** in `translations.js`.
- When adding a persisted field, update the default object literal **and** the parsed-from-`localStorage` merge in `SettingsContext.tsx` (or create a parallel pattern in the relevant context).
- When adding a new screen, mirror the existing pattern in `App.tsx` (route on `phase`) and put it in `src/components/`.
- When adding CSS, follow the design tokens in `:root` and `html[data-theme="light"]`. Provide hover/active/focus states and a transition timing ≤ `0.3s` for tactile UI feedback.
- When changing timer logic (or any TS/TSX file), run `bun run build` to verify `tsc -b` passes — this is the only enforced compile gate.
- When adding i18n variants, keep flag emoji usage **inside `Header.tsx`'s `LANGUAGES` constant only**.

### 🧪 Testing new components / changes

- Since there is no test framework, manual verification checklist:
  1. `bun run dev` — open the running app and walk through `idle → hot → cold → finished → stats → back to idle`.
  2. Toggle theme via the sun/moon icon; reload to confirm persistence.
  3. Change language and confirm **every visible string** updates.
  4. Resize the window / use DevTools device mode — verify at 360px, 768px, and 1200px.
  5. `bun run build` clean, then `bun run preview` — confirm the PWA install banner behaves as expected.
  6. Clear `localStorage` (DevTools → Application) and reload — defaults should restore without console errors.

### 📝 Commit/PR conventions (observed in recent history)

- Conventional Commits style: `feat:`, `fix:`, `feat(ui):`, `chore:`, `docs:`.
- Keep commits scoped to a single concern (UI icons, timer logic, scrollbar, etc.).
- Do not commit agentic state files such as `MEMORY.md` or `.omg/` (both are already `.gitignored`).
