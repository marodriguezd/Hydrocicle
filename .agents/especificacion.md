# Especificación funcional — HydroCycle

> Requisitos del producto. Cualquier propuesta de cambio que rompa algo de aquí merece conversación previa con el humano.

## Producto
PWA que guía al usuario en duchas de contraste (alternancia calor/frío) y exposición al frío. Pensada para usarse en el baño, sin tener que mirar la pantalla.

## Requisitos funcionales

### Sesión
- Una sesión alterna fases `hot` y `cold` durante un número configurable de rondas (1–10).
- Cada fase tiene una duración configurable (15–600 s; `hotDuration` puede ser 0).
- Controles siempre disponibles en `ShowerScreen`: `play`, `pause`, `restart` (vuelve a `idle`), `skip` (avanza a la siguiente fase/ronda), `finish` (aborta sin guardar).
- Cuenta regresiva audible (pitido cada segundo en los últimos 5 s) + vibración háptica sincronizada.
- Al cerrar la sesión se persiste un registro en `history`.

### Presets (`ConfigScreen`)
- `standard` — 2 m calor / 1 m frío / 1 ronda.
- `extended` — 5 m calor / 2 m frío / 1 ronda.
- `coldshock` — 0 m calor / 3 m frío / 1 ronda.
- `custom` — sliders sin restricción; `coldDuration` mínimo 15 s.

### Configuración persistente (`localStorage["hydrocicleConfig"]`)
- `hotDuration`, `coldDuration`, `rounds`, `volume`, `soundscape`, `language`, `theme`, `preset`.
- El parseo está envuelto en `try/catch` con defaults seguros — cualquier cambio de esquema debe ser **aditivo**.

### Historial persistente (`localStorage["hydrocicleHistory"]`)
- Cada sesión completada se guarda como `SessionHistory`:
  `{ id, date, rounds, hotDuration, coldDuration, totalColdTime, totalTime }`.
- Streaks: `currentStreak` (con tolerancia día-1) y `longestStreak` recalculados en cada cambio de `history`.

### Audio
- Volumen 0–100 % configurable; aplica a cues sintetizados y sonidos ambientales.
- **Cues sintetizados** (Web Audio API, sin archivos):
  - Sirena al cambiar de fase — square wave 880 Hz → 704 Hz.
  - Fanfarria al cerrar — sine arpeggio C5 → E5 → G5 → C6.
  - Pitido en cuenta regresiva de 5 s — sine D5.
- **Soundscapes ambientales**: `none` / `rain` / `ocean` / `wind`. `.mp3` en `public/assets/`.
- `vibrate(patrón)` se invoca en transiciones (`[300,100,300]`), cuenta regresiva (`[100]`) y cierre (`[500,200,500,200,1000]`). Fallar silenciosamente si el dispositivo no soporta.

### Estadísticas (`StatsScreen`)
- Streaks: actual (verde-azul) + mejor histórico.
- Total de sesiones completadas.
- Promedio de tiempo en frío sobre todas las sesiones.
- Lista de las últimas N sesiones con indicador visual por icono:
  - `Snowflake` (verde-azul) si `totalColdTime ≥ 180 s`.
  - `Droplet` (azul) si `≥ 60 s`.
  - `Timer` (ámbar) si `< 60 s`.
- Acciones de gestión: borrar una entrada (con `window.confirm`) y "Borrar Historial" (confirm global).

### Localización
- 7 locales **obligatorios**: `en, es, fr, it, de, pt, zh`.
- `useTranslation()` con `t(key, { placeholders })`. Interpolación con `{}` (una sola llave).
- `t(key)` solo cae a inglés si el locale activo falta esa clave; nunca a otro idioma arbitrario.

### Personalización
- Temas: `dark` (default) y `light`. Aplicado vía atributo `data-theme` en `<html>`.
- Idioma cambiable desde el `Header` (dropdown con 7 entradas + bandera).

### PWA / Offline
- Instalable en home screen (Android Chrome, iOS Safari).
- Service Worker pre-cachea assets — la app debe funcionar totalmente offline después del primer load.
- `registerType: 'autoUpdate'`. Comprobación de updates al recuperar foco y cada 30 min.

## Fuera de alcance
- Cuentas de usuario, sincronización en la nube, métricas cruzadas entre dispositivos.
- Sensores del dispositivo (acelerómetro, geolocalización, pulsómetro, etc.).
- Notificaciones push.
- Integración con Apple Health / Google Fit.
- Backend o llamadas de red. `metadata.json` y `.env.example` (con `GEMINI_API_KEY`/`APP_URL`) son vestigios del fork AI Studio original y **no se importan**.
