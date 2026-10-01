# HabitFlow 🌱

A modern, minimal and local-first habit tracker built with **React + Vite**. HabitFlow helps users build consistent habits, track progress, monitor streaks, and understand their performance through simple visual insights.

## ✨ Features

- 📅 Daily habit tracking
- 📊 Weekly progress tracking
- 🗓️ Monthly calendar view
- 📈 Monthly completion graph
- 🔥 Habit streak tracking
- 📊 Statistics and performance insights
- 🔔 Habit reminder notifications
- 📱 Responsive interface
- ⚡ Offline/PWA support
- 💾 Local data persistence using IndexedDB
- 🔒 No account required

## 🛠️ Tech Stack

- **Frontend:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB
- **PWA:** vite-plugin-pwa / Service Worker
- **Notifications:** Browser Notifications API

## 🧠 How It Works

HabitFlow follows a local-first architecture. Habit data and completion history are stored directly in the user's browser using IndexedDB, allowing the application to work without requiring a backend or user account.

The application provides Daily, Weekly, Monthly, and Statistics views for managing habits and understanding progress.

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/Veeraarun/HabitFlow.git
cd HabitFlow
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## 📁 Project Architecture

- **HabitsProvider / React Context** — Shared application state
- **IndexedDB** — Persistent local storage
- **Daily / Weekly / Monthly views** — Habit and progress management
- **Statistics** — Performance and completion insights
- **Reminder system** — Browser notifications and service-worker support

## 🔐 Privacy

HabitFlow is designed as a **local-first application**. Habit data, completion history and reminder records are stored locally in the browser. No account or backend is required.

## 🎯 Project Goals

HabitFlow demonstrates:

- React component development
- State management with React Context
- Responsive UI development
- IndexedDB browser storage
- Progressive Web App functionality
- Browser notifications
- Data visualization and dashboard-style interfaces

## 🌐 Live Demo

🚀 **[Open HabitFlow Live](https://myhabix.vercel.app/)**

Deployed with **Vercel**.

## 👨‍💻 Author

**Veera Arun**

- GitHub: https://github.com/Veeraarun
- Repository: https://github.com/Veeraarun/HabitFlow

---

⭐ If you find HabitFlow useful, consider giving the repository a star!
