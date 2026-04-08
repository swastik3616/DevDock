<div align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Flask-Python-000000?style=flat-square&logo=flask&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=flat-square&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/Tests-33%20passing-22C55E?style=flat-square" />

# 🖥️ AquaDesk

**A full-stack macOS desktop simulation built from scratch — running entirely in the browser.**

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Testing](#-testing) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## Overview

AquaDesk is a sophisticated web-based OS simulation that faithfully replicates the macOS experience. It features a **MacBook intro sequence** — on first load you see a black screen with a centered Apple logo, exactly like opening a real MacBook lid. Clicking triggers a 3D lid-open animation that reveals the desktop. Shutdown gracefully reverses the sequence.

The system uses a fully decoupled **React 19 + TypeScript** SPA on the frontend communicating with a **Python Flask** REST API backed by **MongoDB**.

---

## ✨ Features

### 🖱️ Desktop Shell
- Pixel-perfect macOS-style Dock with magnification hover animations
- Persistent MenuBar with live clock, Apple menu, and active-app title
- Right-click ContextMenu with full keyboard-accessible markup
- Wallpaper picker and Light/Dark theme toggle via System Settings
- Sleep mode (full-screen overlay), Shutdown with lid-close animation

### 🪟 Window Management
- Physics-based drag-and-drop via `framer-motion`
- Maximize/restore with 32 px MenuBar-aware offset
- Z-index focus management — clicking a window brings it to front
- Per-app minimize to Dock

### 📦 Built-in Applications

| App | Description |
|---|---|
| **Finder** | Virtual file system with full CRUD (rename, delete, upload) |
| **Terminal** | CLI interface — `ls`, `mkdir`, `touch`, `rm` mapped to REST calls |
| **Notes** | Persistent note-taking backed by MongoDB with real-time save |
| **Calculator** | Stateful expression evaluator — fully unit-tested |
| **Safari** | Multi-tab iframe browser with bookmarks and search fallback |
| **AquaMail** | Zen Compose Mode, Smart Action Extractor, Burn-After-Reading animation |
| **Photos** | CSS masonry grid with HTML5 drag-and-drop and FileReader/Base64 upload |
| **Music** | REST-backed track metadata with a floating `framer-motion` mini-player |
| **Jarvis** | Conversational AI assistant via `/api/ai/chat` |
| **Siri** | Browser-native `SpeechRecognition` API dispatching OS-level voice commands |
| **System Settings** | Wallpaper picker and appearance controls wired directly to global state |

---

## 🏗️ Architecture

```
aqua-desk/
├── .github/workflows/
│   ├── frontend-ci.yml       # Vitest + tsc type-check
│   └── backend-ci.yml        # Pytest
├── client/                   # React 19 SPA (Vite)
│   └── src/
│       ├── __tests__/        # 15 Vitest tests
│       ├── apps/             # Application windows
│       ├── components/       # Shell & system UI
│       ├── services/api.ts   # Axios + JWT interceptor
│       └── store/            # Zustand global state
├── server/                   # Flask REST API
│   ├── routes/               # Modular blueprints
│   ├── tests/                # 18 Pytest tests
│   ├── app.py                # create_app() factory
│   └── requirements.txt
└── docker-compose.yml
```

### Frontend Stack

| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript 5 + Vite |
| Animation & Drag | `framer-motion` v12 |
| Global State | `Zustand` v5 |
| Styling | Tailwind CSS v4 + custom CSS (glassmorphism) |
| HTTP Client | `axios` with JWT request interceptor |
| 3D Intro | Pure CSS 3D perspective + `requestAnimationFrame` |

### Backend Stack

| Concern | Technology |
|---|---|
| Framework | Python Flask (micro-framework) |
| Database | MongoDB via `flask-pymongo` |
| Auth | Stateless JWT (`PyJWT`) + `bcrypt` password hashing |
| CORS | `flask-cors` — `localhost:5173` ↔ `localhost:5000` |
| Routes | Modular blueprints: `auth`, `files`, `notes`, `music`, `ai` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- Python ≥ 3.8
- MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd server

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create server/.env with:
#   MONGO_URI=<your-mongodb-connection-string>
#   JWT_SECRET=<a-secure-random-string>

# Start the Flask server on port 5000
python app.py
```

### Frontend

```bash
cd client

npm install

# Optional: set API base URL
# Create client/.env:
#   VITE_API_URL=http://localhost:5000

npm run dev    # Vite dev server → http://localhost:5173
```

### Docker (Full Stack)

```bash
# Spin up Frontend + Backend + MongoDB in one command
docker-compose up --build

# App available at http://localhost:5173

docker-compose down
```

---

## 🧪 Testing

The project ships a **33-test dual-layer test suite** that runs completely offline — no live database or network required.

### Backend — Pytest (18 tests)

| File | Coverage |
|---|---|
| `test_auth.py` | Register (success, duplicate, missing fields), login (success, wrong password, unknown user), `GET /auth/me` with valid / missing / invalid token |
| `test_notes.py` | GET empty list, POST create, PUT update, DELETE success, DELETE 404 |
| `test_files.py` | GET seeds defaults, POST upload, DELETE, PATCH rename, PATCH 404 |

> Uses `mongomock` in-memory database via the `create_app()` factory — no live MongoDB required.

```bash
cd server
pytest                  # run all 18 tests
pytest -v --tb=short    # verbose output (matches CI)
```

### Frontend — Vitest (15 tests)

| File | Coverage |
|---|---|
| `store.test.ts` | Initial state, `openApp`, `closeApp`, `minimizeApp`, `toggleMaximize`, `setAuth`, `setTheme` |
| `contextMenu.test.tsx` | Labels & shortcuts render, position props applied as inline styles, click triggers action + `onClose` |
| `calculator.test.tsx` | Initial display "0", digit input, operator resets display, equals evaluates, AC clears |

```bash
cd client
npm test              # Vitest watch mode
npm test -- --run     # Single-pass (CI mode)
```

### CI — GitHub Actions

Two independent workflows trigger on push/PR to `main`, scoped to their respective directories:

| Workflow | Trigger | Steps |
|---|---|---|
| **Frontend CI** | `client/**` changes | `npm ci` → `vitest --run` → `tsc --noEmit` |
| **Backend CI** | `server/**` changes | `pip install` → `pytest -v --tb=short` |

---

## 📡 API Reference

All protected endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | | Register a new user |
| `POST` | `/auth/login` | | Authenticate and receive a JWT |
| `GET` | `/auth/me` | ✓ | Return current authenticated user |
| `GET` | `/files` | ✓ | List virtual filesystem entries |
| `POST` | `/files` | ✓ | Create a new file or folder |
| `PATCH` | `/files/<id>` | ✓ | Rename a file or folder |
| `DELETE` | `/files/<id>` | ✓ | Delete a file or folder |
| `GET` | `/notes` | ✓ | Retrieve all notes |
| `POST` | `/notes` | ✓ | Create a new note |
| `PUT` | `/notes/<id>` | ✓ | Update a note |
| `DELETE` | `/notes/<id>` | ✓ | Delete a note |
| `GET` | `/api/music` | ✓ | Get available music tracks |
| `POST` | `/api/ai/chat` | ✓ | Send a message to the AI assistant |



## 🔒 Security

- **Password hashing** — `bcrypt`; plaintext passwords are never stored or logged.
- **JWT expiry** — Tokens expire after 24 hours; the `axios` interceptor auto-attaches the header on every request.
- **Session termination** — Shutdown clears `localStorage` and resets all Zustand auth state.
- **Microphone** — Siri operates entirely in-memory via the browser's sandboxed `SpeechRecognition` API; no audio leaves the device.
- **iFrame isolation** — Safari app `<iframe>` elements run in isolated browser contexts.



## 🔄 Boot & Shutdown Lifecycle

```
closed (black screen + Apple logo)
  │  ← click logo
opening (lid swings open — rAF cubic ease)
  │  ← lid fully open
booting (Apple logo + progress bar, 2.6 s)
  │  ← boot complete
os/live (LoginScreen → Desktop)
  │  ← shutdown()
shutdown (spinner overlay, 2.4 s)
  │  ← delay complete
closing (lid animates shut)
  └── back to closed — auth & window state cleared
```

---

## 📄 License


MIT — see [LICENSE](LICENSE) for details.
