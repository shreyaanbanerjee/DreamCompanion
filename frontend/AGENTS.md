# Frontend Agent Guidelines (`frontend/`)

This directory contains the React 18 + Vite + TailwindCSS application for **DreamCompanion: Corner Edition**.

---

## 1. Concrete Commands

```bash
# Install dependencies
npm install

# Start local Vite development server (:3000)
npm run dev

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Design System & UI Principles

- **No AI Clutter / Icon Overuse**: Forbid gratuitous cartoon icons (e.g., bot avatars, sparkles, trophies, animated hearts). Use clean, broadcast-grade typography (ESPN Cricinfo / Sky Sports style).
- **Color Palette**: Dark charcoal background (`#0B0F19`, `#111827`, border `#1F2937`) with restrained amber/yellow highlights (`#FACC15`) for CSK accents.
- **Tabular Numbers**: Use monospace fonts (`font-mono`) for numerical scores, strike rates, overs, and timestamps to prevent layout jitter.
- **High Performance Graphics**: The Match Momentum & Fan Tension curve must be rendered using native SVG paths (`polyline`, `path`), not bulky external charting libraries (like Chart.js or Recharts).

---

## 3. State & WebSocket Management

- The frontend connects to `VITE_WS_URL` or dynamically resolves to `ws://localhost:8000/ws/simulator`.
- Always handle WebSocket reconnects with exponential backoff via `SimulatorSocketManager`.
- When match deliveries arrive, update scorecard and momentum curve state immutably without triggering full page re-renders.

---

## 4. Boundaries & Permissions

- **Autonomous**: Editing JSX components, CSS styles, adding helper functions, running builds.
- **Restricted**: Modifying `amplify.yml` build phases without verifying AWS deployment compatibility.

