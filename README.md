# AquaDesk — DevDock OS Architecture & Documentation

## Overview
AquaDesk is a sophisticated web-based operating system simulation that replicates the macOS experience from the ground up. It uses a decoupled client-server model — **React 19 + TypeScript** on the frontend and a **Python Flask** REST API on the backend, with **MongoDB** for persistence.

A defining experience is the **MacBook Intro sequence**: on first load the user sees a pure-black screen with a centered Apple logo (exactly like a real MacBook lid). Clicking the logo triggers a 3-D lid-open animation that reveals the MacBook; the screen then auto-boots into the Login screen. Shutdown reverses the sequence, closing the lid gracefully.

---

## 1. System Architecture

### 1.1 Frontend (Client)
A single-page application (SPA) built with **React 19**, **TypeScript 5**, and **Vite**.

| Concern | Library / Pattern |
|---|---|
| UI Animation & Drag | `framer-motion` v12 — physics-based dragging, window maximization, fade transitions |
| Global State | `Zustand` v5 — manages window registry, auth, sleep/shutdown flags, theme, wallpaper |
| Styling | Tailwind CSS v4 + custom CSS — glassmorphism, dark-mode, responsive layouts |
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
| App Factory | `create_app()` pattern — enables test isolation without a live database |

---

## 2. Testing

The project ships a full dual-layer test suite — **no mocks of real business logic** — that runs completely offline.

### 2.1 Backend — Pytest (18 tests)

| File | Covers |
|---|---|
| `tests/test_auth.py` | Register (success, duplicate, missing fields), login (success, wrong password, unknown user), `GET /auth/me` with valid / missing / invalid token |
| `tests/test_notes.py` | GET empty list, POST creates note (user field stripped), PUT updates, DELETE success, DELETE 404 |
| `tests/test_files.py` | GET seeds default files, POST upload, DELETE, PATCH rename, PATCH 404 |

**How it works:** `create_app()` factory + a `MagicMock` whose `.db` is a real `mongomock` in-memory database. No live MongoDB required.

```bash
cd server
pip install -r requirements.txt   # includes pytest, pytest-flask, mongomock
pytest                             # reads config from pyproject.toml
```

### 2.2 Frontend — Vitest (15 tests)

| File | Covers |
|---|---|
| `src/__tests__/store.test.ts` | Initial state, `openApp` (create + no-duplicate), `closeApp`, `minimizeApp`, `toggleMaximize`, `setAuth`, `setTheme` |
| `src/__tests__/contextMenu.test.tsx` | Renders labels & shortcuts, position props applied as inline styles, click triggers action + `onClose` |
| `src/__tests__/calculator.test.tsx` | Initial display "0", digit input, operator resets display, equals evaluates, AC clears |

**Setup:** `vitest` + `@testing-library/react` + `jsdom`. Each store test starts with a `beforeEach` reset (`useAppStore.getInitialState()`) to prevent state bleed. All user interactions use `userEvent.setup()` (async).

```bash
cd client
npm install
npm test              # Vitest watch mode
npm test -- --run     # single-pass CI mode
```

### 2.3 CI — GitHub Actions

Two independent workflows, both triggered on push/PR to `main`:

| Workflow | File | What it runs |
|---|---|---|
| **Frontend CI** | `.github/workflows/frontend-ci.yml` | `npm ci` → `vitest --run` → `tsc --noEmit` |
| **Backend CI** | `.github/workflows/backend-ci.yml` | `pip install -r requirements.txt` → `pytest tests/ -v --tb=short` |

Each workflow only triggers when files within its own directory (`client/**` or `server/**`) change, avoiding unnecessary re-runs.

---

## 3. Boot & Shutdown Lifecycle

The startup/shutdown sequence is coordinated between `App.tsx`, `MacBookIntro.tsx`, and the `useAppStore` Zustand store.

```
                    ┌──────────────────┐
                    │  closed phase    │  ← Full-screen black + Apple logo
                    │  (first load)    │     "Click to open"
                    └──────┬───────────┘
                           │ click Apple logo
                    ┌──────▼───────────┐
                    │  opening         │  ← Lid swings open (rAF, cubic ease)
                    │                  │     MacBook scales to straight-on view
                    └──────┬───────────┘
                           │ lid fully open
                    ┌──────▼───────────┐
                    │  booting         │  ← Apple logo + progress bar (2.6 s)
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
                    └── back to closed phase, auth cleared
```

### Key Components
- **`MacBookIntro.tsx`** — Manages six phases (`closed → opening → booting → os → shutdown → closing`). Single `requestAnimationFrame` loop for the lid with cubic ease-in-out.
- **`LoginScreen.tsx`** — Shown after OS mounts; hooks into `setAuth` and `shutdown`.
- **`App.tsx`** — Orchestrates `macBookPhase` state and bridges the Zustand `isShuttingDown` flag to `MacBookIntro`.

---

## 4. Core Components & Capabilities

### 4.1 Window Management
- **Maximization**: Subtracts 32 px MenuBar offset (`calc(100vh - 32px)`). Drag disabled when maximized.
- **Focus / Z-index**: Clicking a window elevates its `zIndex` in `useAppStore`.

### 4.2 Desktop Shell

| Component | Role |
|---|---|
| `Desktop.tsx` | Renders wallpaper and hosts all open windows |
| `Dock.tsx` | Application launcher with magnification hover animations |
| `MenuBar.tsx` | Persistent top bar with clock, Apple menu, and active-app title |
| `ContextMenu.tsx` | Right-click context menu (`role="menu"`, fully tested) |
| `MusicWidget.tsx` | Floating mini-player using `framer-motion` drag outside normal window bounds |

### 4.3 Application Ecosystem

| App | Key Implementation Details |
|---|---|
| **Finder** | Full CRUD via `/files`. Inline state machine for file renaming. |
| **Terminal** | Translates `ls`, `mkdir`, `touch`, `rm` into REST calls against `/files`. |
| **Notes** | Persistent via `/notes` (MongoDB). Real-time save. |
| **Calculator** | Stateful expression evaluator; pure client-side, no API calls. Fully unit-tested. |
| **Safari** | Multi-tab `<iframe>` engine with bookmark array state + URI/search fallback. |
| **AquaMail** | DOM-blurring Zen Compose Mode, regex-powered Smart Action Extractor, `framer-motion` Burn-After-Reading sequence. |
| **Photos** | CSS masonry grid + HTML5 Drag-and-Drop; parses `FileReader` blobs to Base64. |
| **Music** | `/api/music` serves track metadata; `MusicWidget` manages playback state. |
| **Jarvis (AI)** | Conversational UI; HTTP POST to `/api/ai/chat`. |
| **Siri** | Browser-native `SpeechRecognition` API (`continuous = true`); voice patterns dispatch OS-level commands. |
| **System Settings** | Desktop (wallpaper picker) and Appearance (Light/Dark toggle) — mutates `useAppStore` directly. |

### 4.4 System Controls
- **Sleep Mode**: `isAsleep` flag mounts a full-screen black overlay; click anywhere to wake.
- **Shutdown**: `shutdown()` → `isShuttingDown` → lid-close sequence → auth & window state cleared.
- **Theme**: `setTheme()` toggles `.dark` on the root `<html>` element for Tailwind conditional overrides.

---

## 5. Environment & Deployment Guide

### 5.1 Prerequisites
- Node.js ≥ 18.x
- Python ≥ 3.8
- MongoDB instance (local daemon or Atlas URI)

### 5.2 Backend Setup
```bash
cd server

# Create and activate virtual environment
python -m venv venv && source venv/bin/activate   # Unix/macOS
python -m venv venv && venv\Scripts\activate      # Windows

# Install all dependencies (including test tools)
pip install -r requirements.txt

# Configure environment
# Create server/.env:
#   MONGO_URI=<your-mongodb-connection-string>
#   JWT_SECRET=<a-secure-random-string>

# Start Flask server (port 5000)
python app.py

# Run tests (no live MongoDB required)
pytest
```

### 5.3 Frontend Setup
```bash
cd client

npm install

# Optional: configure API base URL
# Create client/.env:
#   VITE_API_URL=http://localhost:5000

npm run dev          # Vite dev server on port 5173
npm test             # Vitest in watch mode
npm test -- --run    # Single-pass (for CI)
```

### 5.4 Docker Deployment
```bash
# Build and spin up the full stack (Frontend + Backend + MongoDB)
docker-compose up --build

# App is available at http://localhost:5173

docker-compose down
```

---

## 6. API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Authenticate and receive a JWT |
| `GET` | `/auth/me` | ✓ | Return current authenticated user |
| `GET` | `/files` | ✓ | List virtual file system entries |
| `POST` | `/files` | ✓ | Create a new file or folder |
| `PATCH` | `/files/<id>` | ✓ | Rename a file or folder |
| `DELETE` | `/files/<id>` | ✓ | Delete a file or folder |
| `GET` | `/notes` | ✓ | Retrieve all notes |
| `POST` | `/notes` | ✓ | Create a new note |
| `PUT` | `/notes/<id>` | ✓ | Update a note |
| `DELETE` | `/notes/<id>` | ✓ | Delete a note |
| `GET` | `/api/music` | ✓ | Get available music tracks |
| `POST` | `/api/ai/chat` | ✓ | Send a message to the AI assistant |

> **Auth column**: ✓ = requires `Authorization: Bearer <token>` header.

---

## 7. Security Considerations
- **Password Hashing**: Passwords are hashed via `bcrypt` — plaintext is never stored.
- **Token Expiry**: JWTs expire after 24 hours; the `axios` interceptor attaches the header automatically.
- **Session Termination**: Shutdown clears `localStorage` and resets all Zustand auth state.
- **Microphone**: Siri operates in-memory via the browser's sandboxed `SpeechRecognition` API — no audio is sent to the network.
- **iFrame Isolation**: Safari app `<iframe>` elements run in isolated browser contexts.

---

## 8. Project Structure

```
aqua-desk/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml        # Vitest + tsc type-check on every PR
│       └── backend-ci.yml         # Pytest on every PR
├── client/                        # React SPA
│   └── src/
│       ├── __tests__/             # Vitest test suite (15 tests)
│       │   ├── store.test.ts
│       │   ├── contextMenu.test.tsx
│       │   └── calculator.test.tsx
│       ├── apps/                  # Application windows
│       ├── components/            # Shell & system UI
│       ├── services/
│       │   └── api.ts             # Axios instance with JWT interceptor
│       ├── store/
│       │   └── useAppStore.ts     # Zustand global state
│       └── setupTests.ts          # @testing-library/jest-dom matchers
├── server/                        # Flask REST API
│   ├── routes/
│   │   ├── ai.py
│   │   ├── auth.py
│   │   ├── files.py
│   │   ├── music.py
│   │   └── notes.py
│   ├── tests/                     # Pytest test suite (18 tests)
│   │   ├── conftest.py            # Fixtures: app, client, auth_token
│   │   ├── test_auth.py
│   │   ├── test_notes.py
│   │   └── test_files.py
│   ├── app.py                     # create_app() factory
│   ├── pyproject.toml             # Pytest configuration
│   └── requirements.txt
└── docker-compose.yml
```
