# Device Guardian — Build Log

## Step 1 — 2026-06-12

### What was done

- Created fresh Expo project (`device-guardian-app/`) with TypeScript template, SDK 56
- Installed: expo-router, expo-sqlite, expo-constants, expo-linking, expo-status-bar, react-native-safe-area-context, react-native-screens
- Configured expo-router as entrypoint (`"main": "expo-router/entry"` in package.json)
- Added `scheme: "deviceguardian"` and plugins `["expo-router", "expo-sqlite"]` to app.json
- Wrote full SQLite schema: `household_members`, `devices`, `loss_events` tables with correct foreign keys and cascade deletes
- Wrote typed data-access layer (`src/db/database.ts`) with functions for all three tables
- Wrote TypeScript types for all models (`src/types/index.ts`)
- Created expo-router layout (`app/_layout.tsx`) with DB initialisation on app start
- Created placeholder home screen (`app/index.tsx`)
- Created DB smoke-test screen (`app/db-test.tsx`) — runs 6 automated tests

### Note: existing web app

The `device-guardian/` folder contains the earlier web (Vite/React) prototype. It has not been touched.

### What to check on your iPhone

1. Install **Expo Go** from the App Store if you haven't already.
2. Open the QR code the dev server prints and scan it in Expo Go (or use the Expo Go app → Enter URL and paste the `exp://` address).
3. You should see a screen titled **Device Guardian** with a red button.
4. Tap **"Run DB smoke test →"**.
5. You should see **6 green checkboxes** and "🎉 All tests passed" at the bottom.
6. If any test shows ❌, take a screenshot and share it — do not approve step 2 yet.

### What is NOT built yet (steps 2–8)

- No device add/edit UI
- No household member management UI
- No emergency mode
- No photos, PDF export, or settings

### Approver sign-off required before step 2

Reply "step 1 approved" once the smoke test passes on your phone.
