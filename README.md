# HabitFlow

A minimal, local-first habit tracker built with React and Vite.

Track daily habits, monitor progress, build streaks, and stay consistent with HabitFlow.

## Features

- Daily habit tracking
- Weekly progress tracking
- Monthly calendar view
- Monthly completion graph
- Habit streak tracking
- Statistics and performance insights
- Reminder notifications
- Offline/PWA support
- Local data persistence using IndexedDB

## Tech Stack

- React
- Vite
- Tailwind CSS
- IndexedDB
- vite-plugin-pwa
- Service Worker
- Browser Notifications API

## Data & Privacy

HabitFlow is local-first.

Habit data, completion history, and reminder records are stored locally in the browser using IndexedDB.

The application does not require an account or backend.

## Running Locally

Clone the repository and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Architecture

- **React Context / HabitsProvider**: Shared state management for habits and completions
- **IndexedDB**: Persistent local storage for all user data
- **Views**: Daily, Weekly, Monthly, and Statistics views for tracking progress
- **Reminder System**: Scheduled notifications for habit reminders via service worker

## Screenshots / Live Demo

*Screenshots and live demo link will be added after deployment.*
