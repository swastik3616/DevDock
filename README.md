# AquaDesk — DevDock OS Architecture & Documentation

## Overview
AquaDesk is a sophisticated web-based operating system simulation designed to replicate the macOS experience from the ground up. The architecture leverages a decoupled client-server model, utilizing React for the presentation layer and a RESTful Python (Flask) API for backend services and data persistence via MongoDB.

A defining experience is the **MacBook Intro sequence**: on first load the user sees a pure-black screen with a centered Apple logo (exactly like a real MacBook lid). Clicking the logo triggers a 3-D lid-open animation that reveals the MacBook in a straight-on perspective; the screen then auto-boots and presents the Login screen. Shutdown reverses the sequence, closing the lid gracefully.

---

## 1. System Architecture

The application is structured into two primary domains:

### 1.1 Frontend (Client)
A single-page application (SPA) built with **React 19**, **TypeScript 5**, and **Vite**.

| Concern | Library / Pattern |
|---|---|
| UI Animation & Drag | `framer-motion` v12 — physics-based dragging, window maximization, fade transitions |
| Global State | `Zustand` v5 — manages window registry, auth, sleep/shutdown flags, theme, wallpaper |
| Styling | Tailwind CSS v4 + custom CSS modules — glassmorphism, dark-mode, responsive layouts |
| Icons | `lucide-react` |
| HTTP Client | `axios` with a JWT-injection request interceptor (`services/api.ts`) |
| 3-D Intro | Pure CSS 3-D perspective + `requestAnimationFrame` (no Three.js dependency) |

### 1.2 Backend (Server)
A RESTful API built on the Python **Flask** micro-framework.

| Concern | Technology |
|---|---|
| Data Persistence | MongoDB (NoSQL) via `flask-pymongo` |
| Authentication | Stateless JWT (`PyJWT`) + `bcrypt` password hashing |
| CORS | `flask-cors` — maps `localhost:5173` → `localhost:5000` for local dev |
| Routes | Modular blueprints: `auth`, `files`, `notes`, `music`, `ai` |

---

## 2. Boot & Shutdown Lifecycle

The entire startup/shutdown sequence is coordinated between `App.tsx`, `MacBookIntro.tsx`, and the `useAppStore` Zustand store.

```
                    ┌──────────────────┐
                    │  closed phase    │  ← Full-screen black + Apple logo
                    │  (first load)    │     "Click to open"
                    └──────┬───────────┘
                           │ click Apple logo
                    ┌──────▼───────────┐
                    │  opening         │  ← Lid swings open (rAF, cubic ease)
                    │                  │     MacBook scales from fullscreen
                    │                  │     to straight-on laptop view
                    └──────┬───────────┘
                           │ lid fully open
                    ┌──────▼───────────┐
                    │  booting         │  ← Apple logo + progress bar
                    │                  │     auto-plays on screen (2.6 s)
                    └──────┬───────────┘
                           │ boot complete
                    ┌──────▼───────────┐
                    │  os (live)       │  ← LoginScreen → Desktop
                    └──────┬───────────┘
            shutdown()     │
         in store   ┌──────▼───────────┐
                    │  shutdown        │  ← ShutdownScreen spinner
                    └──────┬───────────┘
                           │ 2.4 s delay
                    ┌──────▼───────────┐
                    │  closing         │  ← lid animates shut
                    └──────┬───────────┘
                           │ animation complete
                    └── back to closed phase, auth cleared
```

### Key Components
- **`MacBookIntro.tsx`** — Manages six phases (`closed → opening → booting → os → shutdown → closing`). Uses a single `requestAnimationFrame` loop for the lid animation with cubic ease-in-out. On open, the MacBook scales from a fullscreen back-of-lid view down to a straight-on laptop perspective. Exposes `onReady`, `onShutdown`, and `triggerShutdown` props.
- **`LoginScreen.tsx`** — Shown immediately after the OS layer mounts; hooks into `setAuth` and `shutdown`.
- **`App.tsx`** — Orchestrates the `macBookPhase` state (`'intro' | 'os'`) and bridges the Zustand `isShuttingDown` flag to `MacBookIntro`.

---

## 3. Core Components & Capabilities

### 3.1 Window Management
The `Window.tsx` component handles strict bounds-checking and virtualization.
- **Maximization**: Subtracts the 32 px MenuBar offset (`calc(100vh - 32px)`) to prevent overlap with system UI. Drag events are disabled during maximized state.
- **Focus / Z-index**: Clicking anywhere within a window elevates its `zIndex` in `useAppStore`.

### 3.2 Desktop Shell
- **`Desktop.tsx`** — Renders the wallpaper/background and hosts all open windows.
- **`Dock.tsx`** — Application launcher with magnification hover animations.
- **`MenuBar.tsx`** — Persistent top bar with clock, Apple menu trigger, and active-app title.
- **`ContextMenu.tsx`** — Right-click context menu on the desktop surface.
- **`MusicWidget.tsx`** — A persistent floating mini-player that uses `framer-motion` drag outside normal window bounds. Manages `HTMLAudioElement` state with infinite rotation animations.

### 3.3 Application Ecosystem

| App | Key Implementation Details |
|---|---|
| **Finder** | Full CRUD via `/api/files`. Inline state machine for file renaming. |
| **Terminal** | Translates `ls`, `mkdir`, `touch`, `rm` into HTTP REST calls against `/api/files`. |
| **Notes** | Persistent notes backed by `/api/notes` (MongoDB). Real-time save. |
| **Calculator** | Stateful expression evaluator; pure client-side, no API calls. |
| **Safari** | Multi-tab `<iframe>` engine with bookmark array state + URI/search fallback logic. |
| **AquaMail** | Three innovations: DOM-blurring Zen Compose Mode, regex-powered Smart Action Extractor, and `framer-motion` Burn-After-Reading self-destruct sequence. |
| **Photos** | CSS masonry grid + HTML5 Drag-and-Drop; parses `FileReader` blobs to Base64 for immediate rendering. |
| **Music** | Backend route `/api/music` serves track metadata; `MusicWidget` manages playback state. |
| **Jarvis (AI)** | Conversational UI; HTTP POST to `/api/ai/chat` using the configured AI backend. |
| **Siri** | Browser-native `SpeechRecognition` API on a `continuous = true` loop; voice patterns dispatch system-level OS commands. |
| **System Settings** | Two-tab panel: **Desktop** (wallpaper picker, 6 curated Unsplash images) and **Appearance** (Light / Dark theme toggle). Directly mutates `useAppStore`. |

### 3.4 System Controls
- **Sleep Mode**: `isAsleep` store flag mounts a full-screen black overlay (`z-[9999]`); click anywhere to wake.
- **Shutdown**: Calls `shutdown()` in store → sets `isShuttingDown` → `MacBookIntro` plays the lid-close sequence → clears auth & window state on completion.
- **Theme**: `setTheme()` toggles a `.dark` class on the root `<html>` element for system-wide Tailwind conditional overrides.

---

## 4. Environment & Deployment Guide

### 4.1 Prerequisites
- Node.js ≥ 18.x
- Python ≥ 3.8
- MongoDB instance (local daemon or Atlas URI)

### 4.2 Backend Initialization
```bash
# 1. Enter the server directory
cd server

# 2. Create and activate a virtual environment
# Unix/macOS:
python -m venv venv && source venv/bin/activate
# Windows:
python -m venv venv && venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create a .env file with:
#    MONGO_URI=<your-mongodb-connection-string>
#    JWT_SECRET=<a-secure-random-string>

# 5. Start the Flask server (defaults to port 5000)
python app.py
```

### 4.3 Frontend Initialization
```bash
# 1. Enter the client directory
cd client

# 2. Install Node dependencies
npm install

# 3. (Optional) Configure the API base URL
#    Create client/.env:
#    VITE_API_URL=http://localhost:5000

# 4. Start the Vite dev server (defaults to port 5173)
npm run dev
```

### 4.4 Docker Deployment (Containerized)
The project includes a unified `docker-compose.yml` for seamless containerized deployment.

```bash
# Build and spin up the full stack (Frontend, Backend, MongoDB)
docker-compose up --build

# Application is available at http://localhost:5173

# Tear down the environment
docker-compose down
```

---

## 5. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/files` | List virtual file system entries |
| `POST` | `/api/files` | Create a new file or folder |
| `PUT` | `/api/files/<id>` | Rename a file or folder |
| `DELETE` | `/api/files/<id>` | Delete a file or folder |
| `GET` | `/api/notes` | Retrieve all notes |
| `POST` | `/api/notes` | Create or update a note |
| `DELETE` | `/api/notes/<id>` | Delete a note |
| `GET` | `/api/music` | Get available music tracks |
| `POST` | `/api/ai/chat` | Send a message to the AI assistant |

---

## 6. Security Considerations
- **Password Hashing**: Passwords are hashed via `bcrypt` before persistence — plaintext is never stored.
- **Token Expiry**: JWTs define session bounds; the client-side `axios` interceptor automatically attaches the `Authorization: Bearer <token>` header to every request.
- **Session Termination**: Shutdown clears `localStorage` and resets all Zustand auth state.
- **Microphone Telemetry**: The Siri component operates strictly in-memory using the browser's sandbox `SpeechRecognition` API — no audio blobs are dispatched to the network.
- **iFrame Isolation**: The Safari app's `<iframe>` elements are rendered in isolated browser contexts.

---

## 7. Project Structure

```
aqua-desk/
├── client/                    # React SPA
│   └── src/
│       ├── apps/              # Application windows
│       │   ├── CalculatorApp.tsx
│       │   ├── FinderApp.tsx
│       │   ├── JarvisApp.tsx
│       │   ├── MailApp.tsx
│       │   ├── NotesApp.tsx
│       │   ├── PhotosApp.tsx
│       │   ├── SafariApp.tsx
│       │   ├── SettingsApp.tsx
│       │   ├── SiriApp.tsx
│       │   └── TerminalApp.tsx
│       ├── components/        # Shell & system UI
│       │   ├── ContextMenu.tsx
│       │   ├── Desktop.tsx
│       │   ├── DesktopIcon.tsx
│       │   ├── Dock.tsx
│       │   ├── LoginScreen.tsx
│       │   ├── MacBookIntro.tsx   ← Closed-lid splash → lid open → boot
│       │   ├── MenuBar.tsx
│       │   ├── MusicWidget.tsx
│       │   └── Window.tsx
│       ├── services/
│       │   └── api.ts         # Axios instance with JWT interceptor
│       └── store/
│           └── useAppStore.ts # Zustand global state
├── server/                    # Flask REST API
│   ├── routes/
│   │   ├── ai.py
│   │   ├── auth.py
│   │   ├── files.py
│   │   ├── music.py
│   │   └── notes.py
│   ├── app.py
│   └── requirements.txt
└── docker-compose.yml
```
