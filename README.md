# HabitFlow 🌱

A modern habit-tracking web application built with **React + Vite**. HabitFlow is designed around a simple dashboard experience for creating habits, tracking completion, reviewing progress, and building consistent routines.

## 🌐 Live Demo

🚀 **[Open HabitFlow](https://myhabix.vercel.app/)**

## ✨ Features

- Daily habit management.
- Weekly progress view.
- Monthly calendar view.
- Statistics and progress insights.
- Habit streak tracking.
- Habit reminders and browser notifications.
- Responsive desktop/mobile navigation.
- Online/offline status awareness.
- Progressive Web App support.
- Local-first browser data handling.
- Optional Supabase integration.
- No traditional server is required for the core frontend experience.

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **Tailwind CSS 4**
- **IndexedDB / browser storage**
- **Supabase JS**
- **vite-plugin-pwa**
- **Browser Notifications API**
- **Oxlint**

## 🏗️ Architecture

HabitFlow uses React providers and page-level views to keep application state and UI concerns separated.

```text
App
├── AuthProvider
├── HabitsProvider
└── Pages
    ├── Today
    ├── Weekly
    ├── Monthly
    ├── Statistics
    └── Settings
```

A reminder scheduler runs from the application lifecycle and is stopped when the app is unmounted.

## 📁 Project Structure

```text
HabitFlow/
├── src/
│   ├── pages/               # Main application views
│   ├── components/          # Reusable UI components
│   ├── context/             # Authentication and habit state
│   ├── hooks/               # Reusable React hooks
│   ├── services/            # Persistence and reminder logic
│   └── App.jsx              # Main application shell
├── public/                  # Static/PWA assets
├── .env.example             # Environment variable template
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm

### Install

```bash
git clone https://github.com/Veeraarun/HabitFlow.git
cd HabitFlow
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## 🔐 Environment Variables

If you use the optional external services configured by the project, copy the example file:

```bash
cp .env.example .env
```

Never commit real credentials to GitHub.

## 📱 PWA

HabitFlow includes PWA support so the application can behave more like an installable app and continue to provide an app-like experience on supported browsers.

## 🎯 What This Project Demonstrates

- React component architecture.
- Context-based state management.
- Browser persistence.
- Responsive dashboard UI.
- PWA configuration.
- Reminder scheduling.
- Offline/online UX.
- Data-driven progress views.

## 📌 Project Status

Active personal project and full-stack learning portfolio project.

## 👤 Author

**Veera Arun** — [GitHub](https://github.com/Veeraarun)
