# DevDock OS Architecture & Documentation

## Overview
DevDock OS is a sophisticated web-based operating system simulation designed to replicate the macOS experience. The architecture leverages a decoupled client-server model, utilizing React for the presentation layer and a RESTful Python (Flask) API for backend services and data persistence via MongoDB.

## 1. System Architecture

The application is structured into two primary domains:

### 1.1 Frontend (Client)
A single-page application (SPA) built with React 19.2, TypeScript 5.9, and Vite 7.3.
*   **Core UI Engine**: Custom window composition utilizing `framer-motion` (v12.4) for complex physics-based dragging, maximizing, and Z-index management.
*   **State Management**: `Zustand` (v5.0.3) is utilized for low-overhead, global application state, primarily managing the registry of active window IDs, authentication status, and hardware integrations (e.g., the Siri microphone state).
*   **Styling Architecture**: Tailored Tailwind CSS (v4.0.9) coupled with custom CSS modules to execute complex glassmorphism (`backdrop-filter`) and conditional rendering for active/inactive window states (e.g., the persistent traffic-light controls). Icons are provided by `lucide-react` (v0.477.0).

### 1.2 Backend (Server)
A RESTful API built on the Python `Flask` (~3.x) micro-framework.
*   **Data Persistence**: `MongoDB` (NoSQL) accessed via `flask-pymongo` handles the file system registry, user authentication nodes, and persistent application states (e.g., Notes).
*   **Authentication Flow**: Stateless authentication using JSON Web Tokens via `PyJWT` and password hashing via `bcrypt` to secure user environments.
*   **CORS Configuration**: Explicitly configured for local development mapping (`localhost:5173` -> `localhost:5000`) using `flask-cors`.

## 2. Core Components & Capabilities

### 2.1 Window Management Protocol
The core `Window.tsx` component handles strict bounds-checking and virtualization.
*   **Maximization Logic**: Intercepts the green control button to compute the viewport delta, subtracting the 32px MenuBar offset (`calc(100vh - 32px)`) to prevent overlapping critical system UI. Drag events are mathematically disabled during this state.
*   **Focus Management**: Clicking any point within a window triggers a state mutation in `useAppStore`, elevating its `zIndex` above the application herd.

### 2.2 Application Ecosystem
*   **Finder (File System)**: Executes full CRUD operations (Create, Read, Update/Rename, Delete) mapped to the `/api/files` REST endpoints. Implements inline-editing state machines for file renaming.
*   **Safari (Web Browser)**: Utilizes an isolated `<iframe>` environment with dynamic URI parsing to route search queries to external engines seamlessly.
*   **Siri (Voice Recognition Integration)**: Implements the browser's native `SpeechRecognition` API. The engine runs on a `continuous = true` loop to prevent timeout exceptions (`no-speech` errors). Voice patterns are evaluated through regex/string-matching to dispatch system-level commands (e.g., triggering `openApp('safari')`).
*   **System Options (Apple Menu)**: A global, state-driven dropdown mapped to the MenuBar's Apple (``) icon. It controls the `isAsleep` store state to mount a unified `<AnimatePresence>` screen-dimming overlay, and executes `localStorage` cache invalidation to safely terminate authenticated sessions.

## 3. Environment & Deployment Guide

### 3.1 Prerequisite Requirements
*   Node.js Ecosystem (v18.x or later)
*   Python Environment (v3.8 or later)
*   MongoDB Instance (Local daemon or Atlas URI)

### 3.2 Backend Initialization
1. Navigate to the server root: `$ cd server`
2. Initialize and source the virtual environment: 
   * Unix: `$ python -m venv venv && source venv/bin/activate`
   * Windows: `$ python -m venv venv && venv\Scripts\activate`
3. Install dependencies: `$ pip install -r requirements.txt`
4. Establish environment variables in `.env` (`MONGO_URI`, `JWT_SECRET`).
5. Boot the WSGI server: `$ python app.py` (Defaults to Port 5000)

### 3.3 Frontend Initialization
1. Navigate to the client root: `$ cd client`
2. Install Node packages: `$ npm install`
3. Initialize the development server: `$ npm run dev` (Defaults to Port 5173)

### 3.4 Docker Deployment (Containerized)
The project includes a unified `docker-compose.yml` configuration for seamless, containerized deployment across environments.
1. Navigate to the project root containing `docker-compose.yml`.
2. Ensure Docker Desktop or the Docker daemon is running.
3. Build and spin up the entire stack (Frontend, Backend, and MongoDB isolated containers):
   ```bash
   docker-compose up --build
   ```
4. Access the application at `http://localhost:5173`.
5. To gracefully tear down the development environment, execute:
   ```bash
   docker-compose down
   ```

## 4. Security Considerations
*   **Authentication**: Passwords are mathematically hashed via Bcrypt prior to persistence.
*   **Token Expiry**: JWTs dictate session bounds and must be explicitly handled by the client-side `axios` interceptors.
*   **Microphone Telemetry**: The Siri component strictly operates in memory and does not dispatch audio blobs to the network, ensuring compliance with browser sandbox policies.
