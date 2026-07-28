# Progreso del agente — HydroCycle

> Estado vivo de las tareas en curso. Piensa en esto como un mini-Kanban versionado en git, sincronizado al inicio, durante y al cierre de cada tarea.

## En curso
_Ninguna tarea abierta._

## Pendientes
_Ningún pendiente._

## Hecho recientemente

- **[docs]** (2026-07-28) Creado `AGENTS.md` (anteriormente `OPENCODE.md`) en la raíz con: resumen de proyecto, comandos, convenciones, reglas para el agente y referencia explícita al knowledge base `.agents/`.
- **[docs]** (2026-07-28) Creada estructura `.agents/` con cinco ficheros:
  - `especificaciones.md` — índice / TOC.
  - `especificacion.md` — especificación funcional.
  - `arquitectura.md` — mapa técnico.
  - `memoria.md` — conocimiento persistente.
  - `progreso.md` — este fichero.

## Decisiones abiertas / cosas para aclarar con el humano

- ¿`progreso.md` debe commitearse o `.gitignore`-arse? En algunos proyectos el Work-In-Progress es efímero y se regenera cada sesión — pero aquí también sirve como historial visible para PRs. Decisión pendiente.
- ¿Vale la pena añadir un test runner ligero (Vitest) o el proyecto se mantiene intencionalmente sin él? `tsc -b` es actualmente la única compuerta automática.
- ¿`.omg/` (ya en `.gitignore`) cumple alguna función? Si es un directorio legacy, documentar o eliminar.

## Known issues / deuda técnica
_Ninguno registrado._

## Ideas / mejoras futuras (no comprometidas)
- Añadir un componente `<ConfirmModal/>` para reemplazar `window.confirm`, que actualmente se usa en `StatsScreen.tsx` para borrar entradas / limpiar el historial.
- Exponer la lista de sonidos ambientales como catálogo configurable (con preview inline) en vez de cuadrícula fija de 4 botones.
- Internacionalizar las unidades de tiempo en `formatTime` (actualmente mezcla `Xs`, `(Xm Ys)`).

## Cómo actualizar este fichero

- **Al empezar una tarea:** muévela de "Pendientes" a "En curso" con una descripción de una línea y la fecha de inicio (`YYYY-MM-DD`).
- **Durante la tarea:** registra blockers y decisiones inline en la entrada.
- **Al terminar:** sácala de "En curso" y ponla en "Hecho recientemente" con su tipo (`[feat]`/`[fix]`/`[docs]`/etc.) y un resumen breve.
- **Al descubrir deuda o un nuevo pitfall:** apúntalo en las secciones respectivas con fecha y, si es posible, un enlace al código relevante (ruta relativa).
