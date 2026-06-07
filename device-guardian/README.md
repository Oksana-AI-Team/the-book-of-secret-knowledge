# Device Guardian — Human Recovery System

Built for the person who just lost their phone at 2am. No erase buttons. No panic. Just the next right thing.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo (or the monorepo it's in).
2. Go to vercel.com → New Project → import the repo.
3. Set the **Root Directory** to `device-guardian`.
4. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
5. Deploy. Done. No environment variables needed.

## What's inside

| Tab | What it does |
|-----|-------------|
| 🚨 Lost Device | One-tap emergency mode. Step-by-step: call it, locate it, ring it, lock it, trace it. |
| 📱 My Devices | Add your devices to a local inventory. Step-by-step setup instructions per device type. |
| 🗺️ Trace & Recover | Google Timeline, last Wi-Fi, offline finding, send last location, cloud backup check. |
| 🛡️ Prevention | Digital checklist, physical tracker recommendations, the one habit that matters. |
| ☁️ Backups | Four-item backup check with progress bar and how-to instructions. |

## Design decisions

- **No erase button anywhere.** Humans recover devices. Corporations erase them.
- **One question per screen** in Emergency Mode — stressed people can't read paragraphs.
- **localStorage only** — no backend, no account, no credit card. Works offline after first load.
- **All external links open in a new tab** — the app is your home base, not a portal.
- **Dark mode toggle** — easier on eyes at 2am in a petrol station parking lot.

## Tech

- React 19 + TypeScript
- Vite 8
- No external dependencies beyond React itself
