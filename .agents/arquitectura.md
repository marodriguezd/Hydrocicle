# Arquitectura — HydroCycle

> Mapa estructural del sistema. Úsalo antes de tocar código para entender cómo encajan las piezas sin tener que leer todo `src/` a ciegas.

## Stack en una frase
React 19 + TypeScript + Vite 6 + `vite-plugin-pwa`. Sin backend. Toda la persistencia vive en `localStorage`; todo el audio de cues se genera con la Web Audio API (los sonidos ambientales son `.mp3` reales en `public/assets/`).

## Capas

### Entrada
- `index.html` declara `<meta>` PWA y carga Google Fonts (`Outfit`).
- `src/main.tsx` registra el Service Worker (autoUpdate agresivo), monta `<StrictMode><App/></StrictMode>`.

### Provider tree (`src/App.tsx`)
Orden intencional y load-bearing — **no reordenar**:

```
SettingsProvider  →  SessionProvider  →  HistoryProvider  →  TimerProvider  →  <MainApp/>
```

- `SettingsProvider` — config del usuario, persistida en `localStorage["hydrocicleConfig"]`. Aplica `data-theme` al `<html>` cuando cambia.
- `SessionProvider` — máquina de estados de la **sesión activa** (no persistida).
- `HistoryProvider` — sesiones pasadas + rachas; persistida en `localStorage["hydrocicleHistory"]`.
- `TimerProvider` — efectos sobre `SessionContext` (intervalo 1 s, transiciones, `playTone`, `vibrate`). Consume `useSettings` y `useSession`.
- `MainApp` lee `phase` de `useSession()` y renderiza una sola pantalla + Header + SoundscapeManager siempre montados.

### Router de pantallas (por `phase`)
| `phase` | Pantalla |
|---|---|
| `idle` | `ConfigScreen` |
| `hot` \| `cold` | `ShowerScreen` |
| `finished` | `ResultsScreen` |
| `stats` | `StatsScreen` |

## Máquina de estados (`SessionContext` + `TimerContext`)
Transición: `idle → hot → cold → (siguiente ronda) hot → cold → … → finished`. `stats` es un modo "fuera de banda" alcanzable solo desde `idle`. Ver `TimerContext.transitionToNext()` para la lógica exacta (incluye el caso `hotDuration === 0` y el paso directo a `finished` al cerrar la última ronda).

## Contextos: contrato de cada uno

| Context | Estado expuesto | Mutadores clave |
|---|---|---|
| `SettingsContext` | `config: AppConfig` | `updateConfig(updates)` |
| `SessionContext` | `phase, currentRound, timeLeft, isPlaying, roundResults` | setters planos + `resetSession()` |
| `TimerContext` | — (sin estado expuesto) | `startSession, stopSession, skipPhase` + `playTone/vibrate` re-exportados |
| `HistoryContext` | `history, currentStreak, longestStreak` | `addSession, removeSession, clearHistory` |

## Audio
- **Cues sintetizados (no se bundlean archivos).** `playTone(frequency, durationMs, volume, oscillatorType)` exportado desde `TimerContext.tsx`:
  - Sirena 880 → 704 Hz al transicionar.
  - Arpegio C5–C6 al cerrar.
  - Pitido D5 en cuenta regresiva de 5 s.
- **Ambient soundscapes (`.mp3` reales).** `public/assets/{rain|ocean|wind}.mp3`. Resueltos por `SoundscapeManager` y `ConfigScreen` con `${import.meta.env.BASE_URL || '/'}assets/${config.soundscape}.mp3`. Loop infinito, control de volumen desde `react-dom`.

## PWA
- `vite-plugin-pwa`, `registerType: 'autoUpdate'`. Service Worker se actualiza al recuperar foco + cada 30 min.
- Manifiesto: `public/manifest.json` (declarativo) + sección `manifest:` duplicada en `vite.config.ts` (auto-generada por VitePWA). Mantenerlas sincronizadas.
- `vite.config.ts` define `base: '/Hydrocicle/'` — implica que el repo vive bajo `github.com/<owner>/Hydrocicle` (carpeta local `Hydrocicle` con C mayúscula en el path publicado).

## Internacionalización
- `src/translations.js` (`.js`, **no `.ts`**, porque hace un side-effect import que setea `window.translations`) → 7 locales: `en, es, fr, it, de, pt, zh`.
- `useTranslation()` retorna `{ t, language }`. `t(key, { placeholders })` usa interpolación `{nombre}` (UNA sola llave).
- Cualquier cadena visible nueva exige añadir la clave en los 7 bloques.

## Estilos
- Todo CSS vive en `src/index.css`. **Un solo fichero.**
- Tokens (custom properties) en `:root`, override en `html[data-theme="light"]`. Variables nuevas van en ambos bloques.
- Layout mobile-first (`.container { max-width: 480px }`). A `≥768px` el `.container` gana `height: 90dvh` y `border-radius: 2rem`. No back-porte `border-radius` a móvil.
- `body` centrado con flex para proyectar el layout móvil en pantallas grandes.
- `env(safe-area-inset-*)` donde pueda chocar con notch iOS.
- Clases en kebab-case. Animaciones sobre `transform`/`opacity` (GPU-friendly).
- Iconos exclusivamente `lucide-react`. **No reintroducir emojis en UI.**

## Build / deploy
- `bun run build` ejecuta `tsc -b && vite build` → `./dist`.
- GitHub Actions (`.github/workflows/deploy.yml`) hace deploy a GitHub Pages en cada push a `main`, usando Bun.
- `bun.lock` está presente — usar `bun install` para mirror exacto con CI. `npm`/`pnpm` funcionan localmente.

## Convenciones de código (resumen)
- Componentes: `PascalCase`, named export. **Default export solo en `App.tsx`.**
- Hooks: `useX` (camelCase). `useX` lanza si se usa fuera de su `XProvider`.
- Variables/funciones: `camelCase`. Tipos/interfaces: `PascalCase`. Estados de uniones: string-literal unions (`SessionPhase = 'idle' | 'hot' | 'cold' | 'finished' | 'stats'`).
- Efectos colaterales (`useEffect`) deben manejar explícitamente cleanup de timers, audios, intervals.
