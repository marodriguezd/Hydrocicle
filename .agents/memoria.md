# Memoria del agente — HydroCycle

> Conocimiento persistente que el agente ha ido acumulando sesión tras sesión. **Edita, no borres**: cuando una entrada quede obsoleta, márcala con `> [OBSOLETO en YYYY-MM-DD]` y mantenla por trazabilidad.

## Decisiones de diseño (no revertir sin discusión con el humano)

- **Sin backend.** La app es 100 % frontend. `metadata.json` y `.env.example` son restos de un fork AI Studio original; no se importan ni se referencian desde código. No añadir llamadas de red.
- **Cues de audio siempre sintetizados.** Nunca bundlear `.wav`/`.mp3` para sirenas, fanfarrias o cuenta regresiva. Usar `playTone(...)` exportado desde `TimerContext.tsx`. Los `.mp3` en `public/assets/` se reservan **solo** a sonidos ambientales (rain/ocean/wind).
- **Lucide para iconos en UI.** El README todavía muestra 🥶/💧/⏱️ como ejemplos en la documentación, pero la UI ya está migrada a `Snowflake / Droplet / Timer` (en `StatsScreen.tsx`) y a `Flame / Snowflake / Play / Pause / RotateCcw / SkipForward` (en `ShowerScreen.tsx`). No reintroducir emojis en pantallas.
- **Context API, no librería de estado externa.** Zustand/Redux/Jotai están fuera de la arquitectura del proyecto.
- **CSS hand-written en `src/index.css`.** Tailwind y CSS-in-JS están prohibidos. Un solo fichero de estilos.
- **No hay runner de tests, linter ni formateador configurados.** Antes de añadir uno (Vitest, ESLint, Prettier), preguntar al humano.

## Convenciones observadas (commit history)

- Conventional Commits: `feat:`, `fix:`, `feat(ui):`, `chore:`, `docs:`.
- Commits pequeños, una preocupación a la vez.
- Ficheros en `.agents/` no deben contener secretos, datos personales, ni contenido efímero de una sesión concreta.

## Gotchas y trampas conocidas

- `vite.config.ts` define `base: '/Hydrocicle/'`. Si renombras la carpeta, el repo, o migras el deploy fuera de GitHub Pages, actualiza también `base` y todas las referencias en `public/manifest.json` + `index.html`, o el PWA se romperá.
- `src/translations.js` debe quedarse como `.js`, **no** migrar a `.ts`: hace un side-effect import que setea `window.translations` al cargarse.
- El orden de providers en `App.tsx` es **load-bearing**. `TimerProvider` consume `useSettings` y `useSession`; reordenarlo rompe la inicialización.
- `npx tsc` puede resolver al paquete equivocado (`tsc@2.0.4`) si `node_modules/.bin` no está en PATH. Usar `bunx tsc -b` o `npm run build` para evitarlo.
- `SoundscapeManager` y `ConfigScreen` resuelven `${BASE_URL}assets/${soundscape}.mp3`. Si añades un nuevo sonido ambiental, el `.mp3` debe existir físicamente en `public/assets/` y el selector en `ConfigScreen.tsx` + la clave `soundscape_<key>` en `translations.js` (los 7 locales) deben estar sincronizados.
- `localStorage` no tiene versionado de esquema. Los parseos están envueltos en `try/catch`. Cambios al esquema de `hydrocicleConfig` o `hydrocicleHistory` deben ser **aditivos** y mantener defaults seguros.
- `playTone` en `TimerContext.tsx` utiliza una ganancia efectiva `effectiveVolume = volume * 2` (amplificación 2.0x mediante Web Audio API `GainNode`) para garantizar que los pitidos de la cuenta atrás de 5s y los cambios de fase se escuchen con suficiente volumen sobre la música de fondo.
- `lint`/`format` no existen — `tsc -b` es la **única** compuerta automática. Compilaciones de TypeScript pasan por `tsc -b && vite build` en CI.

## Historial de cambios relevantes (resumen)

- Migración de emojis a iconos `lucide-react` en UI (commit: `feat: replace emojis with lucide icons`).
- Service Worker con `autoUpdate` agresivo: comprobación al recuperar foco + cada 30 min.
- Implementación de presets `standard` / `extended` / `coldshock` / `custom` con sliders bloqueados fuera de `custom`.
- Cálculo de rachas actualizadas con tolerancia día-1 (`Math.floor((today - lastSession) / (24*60*60*1000)) ≤ 1`).
- `SettingsContext` migrado a `try/catch` alrededor de `JSON.parse` con defaults seguros.
- Rediseño UI: glassmorphism unificado, pulsating hexagon, improve progress bar, simplify rounds default = 1.

## Referencias cruzadas

- Reglas estáticas del agente → [`../AGENTS.md`](../AGENTS.md)
- Detalles técnicos (contextos, máquina de estados, audio) → [`./arquitectura.md`](./arquitectura.md)
- Requisitos del producto → [`./especificacion.md`](./especificacion.md)
- Estado vivo de tareas → [`./progreso.md`](./progreso.md)
- Índice de `.agents/` → [`./especificaciones.md`](./especificaciones.md)
