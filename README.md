# TadHealth Marketing Hub — Refactored File Structure

## Overview

The original single-file `index.html` (~1,100 lines) has been split into logical modules.
The app still runs as a plain HTML app (no build step), using `<script>` tags in order.

## Folder Structure

```
tadhealth-hub/
│
├── index.html                   ← Entry point — loads all scripts & styles
│
├── README.md                    ← This file
│
├── js/
│   │
│   ├── config.js                ← Supabase credentials + React globals
│   ├── constants.js             ← All shared constants (colors, status options, etc.)
│   ├── helpers.js               ← Supabase DB serialization helpers (taskToDb, confToDb, etc.)
│   │
│   ├── hooks/
│   │   ├── useAuth.js           ← Google OAuth + session management
│   │   ├── useTasks.js          ← Kanban tasks + requests queue (Supabase real-time)
│   │   ├── useConferences.js    ← Events/conferences CRUD + SEED data
│   │   ├── useContentItems.js   ← Content calendar items CRUD
│   │   └── useAnalyticsNote.js  ← Persistent analytics notes per group
│   │
│   ├── components/
│   │   ├── SharedUI.js          ← Modal, ModalHeader, Field, NavBar, NavTab, etc.
│   │   └── ConferenceModal.js   ← Event detail/edit modal
│   │
│   └── pages/
│       ├── LoginPage.js         ← Google sign-in screen
│       ├── HubPage.js           ← Home hub with 3 navigation cards
│       ├── KanbanPage.js        ← Project tracker (board + list views)
│       ├── TaskModal.js         ← Task create/edit modal
│       ├── CalendarPage.js      ← Content calendar (month + list views)
│       ├── ContentItemModal.js  ← Content item create/edit modal
│       ├── AnalyticsDashboard.js← Event ROI + analytics charts
│       └── EventsPage.js        ← Event strategy (BizDev + UserRev tabs)
│
└── js/
    └── App.js                   ← Root <App> component + ReactDOM.createRoot
```

## How to Edit

- **Add a new page?** Create a file in `js/pages/`, then add a `<script>` tag in `index.html` before `App.js`.
- **Add a new hook?** Create a file in `js/hooks/`, add its `<script>` tag in `index.html` before any page that uses it.
- **Change brand colors?** Edit `js/constants.js` — the `C` and `UR` objects.
- **Change Supabase credentials?** Edit `js/config.js`.

## Script Load Order (index.html)

Scripts must be loaded in dependency order:

1. CDN libs (React, ReactDOM, Supabase)
2. `config.js`
3. `constants.js`
4. `helpers.js`
5. hooks (useAuth → useTasks → useConferences → useContentItems → useAnalyticsNote)
6. components (SharedUI → ConferenceModal)
7. pages (Login → Hub → TaskModal → Kanban → ContentItemModal → Calendar → AnalyticsDashboard → Events)
8. `App.js`
