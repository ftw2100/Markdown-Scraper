# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Cloudflare Markdown Scraper** — a single-page web app (React 19 + Express 4 + Vite 6 + TypeScript) that extracts Markdown from any webpage via Cloudflare's Browser Rendering API. Users provide a target URL, Cloudflare Account ID, and API Token through the UI.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (starts Express + Vite on port 3000) |
| Lint / type-check | `npm run lint` (`tsc --noEmit`) |
| Production build | `npm run build` (`vite build`) |

### Non-obvious notes

- The dev server (`npm run dev`) uses `tsx` to run `server.ts` directly, which embeds Vite as middleware. There is no separate frontend dev server — everything runs on a single port 3000.
- `better-sqlite3` is listed as a dependency but is **not used** in the current source code. It is a native addon that gets compiled during `npm install`; build failures for it are non-blocking.
- The `GEMINI_API_KEY` in `.env.example` is an AI Studio scaffold artifact — **no code currently uses it**. The app only needs Cloudflare credentials entered at runtime through the UI.
- The server binds to `0.0.0.0:3000` in dev mode, so it is accessible from any interface on the host.
- There are no automated test suites (no test runner configured). Lint (`tsc --noEmit`) is the only automated check.
