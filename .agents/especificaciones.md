# Índice de especificaciones — `.agents/`

> **Estás leyendo el índice.** Este fichero es el punto de entrada a `.agents/`. Si dudas qué abrir, quédate aquí.
> Tabla de contenidos. **Empieza por aquí** si dudas qué fichero abrir de `.agents/`.
> Los documentos de esta carpeta son la memoria persistente del agente: añade, no borres.

## Mapa de la carpeta

| Fichero | Propósito | Cuándo leerlo / actualizarlo |
|---|---|---|
| [`especificacion.md`](./especificacion.md) | Especificación funcional del producto (requisitos, contratos de UI, audio, PWA, localización). | Antes de proponer cambios que rompan requisitos contractuales. |
| [`arquitectura.md`](./arquitectura.md) | Mapa técnico: capas, contextos, máquina de estados, build, audio, persistencia. | Cuando necesites entender cómo encaja una pieza sin leer todo `src/` a ciegas. |
| [`memoria.md`](./memoria.md) | Hechos persistentes, decisiones de diseño, gotchas — lo que el agente aprendió sesión tras sesión. | **Actualízalo cada vez que descubras algo accionable** (convención nueva, pitfall, decisión revertible). |
| [`progreso.md`](./progreso.md) | Estado vivo de tareas: en curso, pendientes, hecho recientemente, deuda técnica. | Actualiza al empezar, durante y al terminar cada tarea. |

## Cómo se usan

1. **Creación / propuesta de cambios.** Lee `especificacion.md` y `arquitectura.md` antes de tocar código. Si rompes un requisito funcional, reabre la conversación con el humano.
2. **Trabajo en curso.** Mantén `progreso.md` sincronizado: tareas abiertas, decisiones tomadas, blockers, registradas con su contexto.
3. **Descubrimiento.** ¿Detectaste un gotcha, una convención nueva, una decisión de diseño no documentada? Apúntalo en `memoria.md` con una entrada fechada y accionable.

## Convenciones de los ficheros de esta carpeta
- **Idioma:** español (consistente con los README bilingües `README.md` / `README.es.md`).
- **Markdown estándar:** tablas y listas siempre que aporten densidad.
- **Cero secretos.** Nada de API keys, tokens, ni datos personales aquí.
- **Trazabilidad:** cita el código real con rutas relativas a la raíz (`src/contexts/...`) en vez de pegar snippets largos.
- **Edita, no borres:** cada entrada de `memoria.md` puede ser útil más adelante aunque hoy parezca obsoleta — márquense obsoletas con `> [OBSOLETO en YYYY-MM-DD]` en lugar de eliminarlas.
