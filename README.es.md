# HydroCycle

<div align="center">
  <img src="public/assets/icon.svg" alt="HydroCycle Logo" width="128" height="128">
  <h3>Guía Interactiva y Temporizador de Terapia de Contraste y Exposición al Frío</h3>

  [![License](https://img.shields.io/badge/License-Apache%202.0-blue)](https://opensource.org/licenses/Apache-2.0)
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen)](https://marodriguezd.github.io/Hydrocicle/)
  [![Made With](https://img.shields.io/badge/Made%20With-React%20%2B%20Vite%20%2B%20TS-61DAFB?logo=react&logoColor=white)](https://react.dev/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

  [Características](#-características) • [Instalación](#-cómo-instalar) • [Tecnologías](#-tecnologías) • [Licencia](#-licencia)
  
  **[🇬🇧 Read in English](README.md)**
</div>

---

## 🌟 Resumen

**HydroCycle** es una aplicación web interactiva diseñada para guiarte en terapias de contraste (duchas calientes/frías) y entrenamiento de exposición al frío. Compartiendo el mismo ecosistema de salud y bienestar que **Bubble Breathing**, te ayuda a gestionar tus intervalos a través de una interfaz limpia a pantalla completa con animaciones en tiempo real, alertas de audio, registro offline de sesiones y estadísticas de racha—sin necesidad de instalación.

<p align="center">
  <img src="https://raw.githubusercontent.com/marodriguezd/Hydrocicle/main/public/assets/demo-screenshot.png" alt="Screenshot de HydroCycle" width="400">
</p>

---

## ✨ Características

- **Experiencia de Exposición Personalizada**
    - **Guía Visual:** Un hexágono dinámico sincroniza su color y pulsaciones según la fase de calor (naranja/rojo) y frío (cian/azul).
    - **Alertas de Audio:** Tonos sintetizados con la Web Audio API (sirenas de transición, fanfarria final y pitidos de cuenta regresiva de 5 segundos) que te guían sin necesidad de mirar la pantalla.
    - **Respuesta Háptica:** Vibraciones del sistema integradas en transiciones y pitidos finales.
    - **Presets Rápidos:** Estándar (2m calor / 1m frío), Extendido (5m calor / 2m frío), **Choque Frío** (3m frío continuo sin fase caliente) y modo Personalizado.

- **Gestión Inteligente de Sesión**
    - **Control de Intervalos:** Alterna automáticamente entre duchas calientes y frías por el número de rondas configurado.
    - **Controles Dinámicos:** Reproducir, pausar, reiniciar o saltar cualquier fase en cualquier momento.
    - **Previsualización de Fase:** Indicador visual que te muestra qué ducha viene a continuación y su duración.

- **📊 Estadísticas y Gamificación**
    - **Panel de Estadísticas:** Tarjetas elegantes estilo glassmorphism que muestran tu racha actual, mejor racha, sesiones totales y promedio de tiempo expuesto al frío.
    - **Historial de Sesiones:** Lista deslizable de tus últimas 10 sesiones con indicadores codificados por color (🥶 ≥180s frío, 💧 ≥60s frío, ⏱️ <60s frío).
    - **Seguimiento Privado:** Guarda tus preferencias y registros localmente en `localStorage` respetando tu privacidad.

- **Experiencia de Usuario Premium**
    - **PWA Listo:** Instálalo en tu pantalla de inicio para una experiencia offline y a pantalla completa.
    - **Temas Oscuro y Claro:** Cambia entre layouts oscuros y claros con persistencia automática.
    - **Soporte Multi-idioma:** Disponible en 7 idiomas: inglés, español, francés, italiano, alemán, portugués y chino simplificado.

---

## 📱 Cómo Instalar

Instala HydroCycle como aplicación web (PWA) para la mejor experiencia:

1. **Abre** la [demo en vivo](https://marodriguezd.github.io/Hydrocicle/) en tu navegador (Chrome en Android, Safari en iOS).
2. **Toca** el botón de Menú (⋮) o Compartir (⎙).
3. **Selecciona** "Añadir a la pantalla de inicio" o "Instalar Aplicación".

*Nota: La aplicación está diseñada para mantenerse responsiva incluso con niveles altos de zoom, como se muestra en la demostración a continuación.*

<p align="center">
  <img src="https://raw.githubusercontent.com/marodriguezd/Hydrocicle/main/public/assets/how_to_install_web_app.gif" alt="Instalación de HydroCycle y Adaptabilidad de Zoom" width="300">
</p>

---

## 🛠️ Tecnologías

| Tecnología | Propósito |
|---|---|
| **React 19** | Interfaz de usuario declarativa y Context API para gestión de estado |
| **TypeScript** | Tipado estricto y lógica robusta |
| **Vite** | Empaquetador y servidor de desarrollo ultrarrápido |
| **vite-plugin-pwa** | Generación de Service Worker y Manifiesto de Aplicación Web |
| **Web Audio API** | Cues de audio sintetizados directamente en el navegador |
| **CSS3** | Glassmorphism, Flexbox, `clamp()` y unidades de viewport dinámicas (`dvh`, `vmin`) |
| **GitHub Actions** | Automatización del despliegue CI/CD a GitHub Pages |

---

## 📄 Licencia

Este proyecto está bajo la licencia **Apache 2.0**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---
<div align="center">
  Creado con ❤️ para una vida más saludable.
</div>
