# HabitFlow

A minimal, local-first habit tracker built with React and Vite.

HabitFlow helps you build consistent habits with flexible schedules, completion history, streaks, statistics, reminders, and offline support.

## Features

- Create, edit, and archive habits
- Daily habits
- Weekly target habits such as 3 times per week
- Specific-day habits such as Monday / Wednesday / Friday
- Completion history
- Frequency-aware streaks
- Weekly and monthly statistics
- Calendar-based history
- Habit reminders
- Browser notifications
- Offline support
- Installable PWA
- Local-first data storage using IndexedDB
- Persistent application settings

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

Habit data, completion history, reminder records, and settings are stored locally in the browser using IndexedDB and localStorage.

The application does not currently require an account or backend.

## Running Locally

Clone the repository and install dependencies:

```bash
npm install