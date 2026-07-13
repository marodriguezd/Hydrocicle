# HydroCycle

<div align="center">
  <img src="public/assets/icon.svg" alt="HydroCycle Logo" width="128" height="128">
  <h3>Immersive Guided Contrast Therapy & Cold Exposure Timer</h3>

  [![License](https://img.shields.io/badge/License-Apache%202.0-blue)](https://opensource.org/licenses/Apache-2.0)
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen)](https://marodriguezd.github.io/Hydrocicle/)
  [![Made With](https://img.shields.io/badge/Made%20With-React%20%2B%20Vite%20%2B%20TS-61DAFB?logo=react&logoColor=white)](https://react.dev/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

  [Features](#-features) • [Installation](#-how-to-install) • [Tech Stack](#-technologies) • [License](#-license)
  
  **[🇪🇸 Leer en Español](README.es.md)**
</div>

---

## 🌟 Overview

**HydroCycle** is an immersive, app-like web application designed for guided contrast therapy (hot/cold shower intervals) and cold exposure training. Part of the same health & wellness ecosystem as **Bubble Breathing**, it helps you manage your intervals through a clean, full-screen interface with real-time animations, audio feedback, offline session tracking, and streaking statistics—without any installation required.

<p align="center">
  <img src="https://raw.githubusercontent.com/marodriguezd/Hydrocicle/main/public/assets/demo-screenshot.png" alt="HydroCycle Screenshot" width="400">
</p>

---

## ✨ Features

- **Personalized Exposure Experience**
    - **Visual Guidance:** A dynamic hexagon synchronizes its color theme and pulsates according to your hot (orange/red) and cold (cyan/blue) exposure intervals.
    - **Audio Cues:** Web Audio API synthesized tones (transition alert sirens, fanfare, and 5-second countdown warning beeps) guide your session without needing to look at the screen.
    - **Haptic Feedback:** System vibration alerts triggered during phase transitions and final countdown warning beeps.
    - **Flexible Presets:** Standard (2m hot / 1m cold), Extended (5m hot / 2m cold), **Cold Shock** (3m cold exposure with no warm phase), and Custom mode.

- **Intelligent Session Management**
    - **Interval Tracking:** Automatically alternates between hot and cold showers for the configured number of rounds.
    - **Dynamic Controls:** Play, pause, restart, or skip any phase at any time.
    - **Next Phase Preview:** Visual indicator showing what phase is coming up next and its duration.

- **📊 Statistics & Gamification**
    - **Stats Dashboard:** Premium glassmorphism panel showing current streak, best streak, total sessions, and average cold exposure duration.
    - **Session History:** Scrollable list of your last 10 sessions with color-coded performance indicators (🥶 ≥180s cold, 💧 ≥60s cold, ⏱️ <60s cold).
    - **Persistent Tracking:** Saves all your preferences and session logs to `localStorage` for complete offline privacy.

- **Premium User Experience**
    - **PWA Ready:** Install it on your home screen for an offline, fullscreen app-like experience.
    - **Dark & Light Themes:** Toggle between dark/light layouts with automatic persistence.
    - **Multilingual Support:** Available in 7 languages: English, Spanish, French, Italian, German, Portuguese, and Simplified Chinese.

---

## 📱 How to Install

Install HydroCycle as a Web App (PWA) for the best experience:

1. **Open** the [live demo](https://marodriguezd.github.io/Hydrocicle/) in your browser (Chrome/Android, Safari/iOS).
2. **Tap** the Menu (⋮) or Share (⎙) button.
3. **Select** "Add to Home Screen" or "Install App".

*Note: The app is designed to stay responsive even at high zoom levels, as shown in the demonstration below.*

<p align="center">
  <img src="https://raw.githubusercontent.com/marodriguezd/Hydrocicle/main/public/assets/how_to_install_web_app.gif" alt="HydroCycle Installation & Zoom Adaptability" width="400">
</p>

---

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI with Context API for state management |
| **TypeScript** | Strict type checking and robust logic |
| **Vite** | High-performance bundler and dev server |
| **vite-plugin-pwa** | Service Worker generation and Web App Manifest |
| **Web Audio API** | Synthesized audio cues (no external sound files) |
| **CSS3** | Glassmorphism, Flexbox, `clamp()`, dynamic viewport units (`dvh`, `vmin`) |
| **GitHub Actions** | Automated CI/CD pipeline for GitHub Pages deployment |

---

## 📄 License

This project is licensed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for details.

---
<div align="center">
  Made with ❤️ for better health.
</div>
