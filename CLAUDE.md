# Project: Device Guardian — Household Device Registry & Recovery System

## 1. What This App Is

A privacy-first iOS app where one household manager registers all family devices (phones, tablets, laptops, earbuds, watches) and, when something is lost, reaches the correct first-party finder service in ≤ 2 taps, plus a complete police/insurance information pack in ≤ 3 taps.

The app links OUT to the correct first-party finder service per device. Any feature implying real-time location tracking of other people's devices must be rejected during development.

## 2. Goals

- A user can register a device in under 60 seconds (photo + type + owner is enough to start)
- In a loss event, a user reaches the correct finder link for that specific device in ≤ 2 taps
- A user can produce a complete police/insurance information pack (serials, photos, values) in ≤ 3 taps
- Ship to App Store within review guidelines on first or second submission

## 3. Non-Goals (v1)

- **No real-time location tracking** — platform-prohibited; we link to first-party services
- **No user accounts / no backend / no cloud sync** — all data stored locally on device. This is a privacy feature AND removes the biggest App Store review risk. Sync is P2.
- **No family-member app installs** — one phone (the household manager's) holds the registry
- **No Bluetooth proximity finder in v1** — planned for v1.1; architect storage so device records can later hold BLE identifiers
- **No Android version yet** — iOS first; keep business logic separable from UI for later port

## 4. Tech Stack

- **Expo (React Native), managed workflow, TypeScript**
- Rationale: EAS cloud builds allow App Store submission without local Xcode dependency; single codebase ports to Android later
- Local persistence: **expo-sqlite** (structured queries for the registry) — not AsyncStorage
- Images stored in app document directory via expo-file-system; DB stores file paths
- expo-image-picker (camera + library) for device photos and receipt photos
- expo-print + expo-sharing for PDF export of the recovery pack
- No analytics SDKs, no ad SDKs, no third-party network calls in v1 (declare "Data Not Collected" honestly in App Store privacy labels)

## 5. Data Model

HouseholdMember
  id, name, color (avatar color), createdAt

Device
  id, memberId (owner), name ("Emma's iPhone")
  category: phone | tablet | laptop | earbuds | watch | tracker | camera | ereader | gaming | other
  ecosystem: apple | samsung | other_android | windows | google | none
  brand, model, serialNumber, imei (nullable), photoPath, receiptPhotoPath
  purchaseDate, purchasePrice, currency, notes
  finderEnabled: yes | no | unknown   (user states whether Find My / Find My Device is ON)
  carrierName (nullable, for phones)
  status: home | lost | recovered_log
  createdAt, updatedAt

LossEvent
  id, deviceId, startedAt, resolvedAt (nullable)
  outcome: recovered | replaced | unresolved (nullable)
  checklistState (JSON: which recovery steps completed)

## 6. Screens & Flows

### 6.1 Home
- Grid/list of devices grouped by household member
- Persistent red "Something is lost" button — always visible, top of screen
- Empty state: friendly onboarding → "Add your first device"

### 6.2 Add/Edit Device
- Progressive form: photo + name + category + owner first; serial/IMEI/receipt collapsed under "Add recovery details (recommended)"
- Helper text per category, e.g. phones: "Dial *#06# on the phone to see its IMEI"
- Ecosystem auto-suggested from category+brand, user-confirmable

### 6.3 Emergency Mode (the red button)
Step 1: "Whose device? Which one?" → pick from registry (or "Not in registry" → generic flow)
Step 2: Calm, numbered, ONE action per screen:
  1. "Call it / play sound — try ringing it from another phone first" (if phone)
  2. One big button → the correct finder service:
     - apple → https://www.icloud.com/find
     - samsung → https://smartthingsfind.samsung.com (verify current Samsung finder URL at build time; findmymobile.samsung.com may redirect)
     - other_android / google → https://android.com/find
     - windows → https://account.microsoft.com/devices
     - none/unknown → skip to step 3
  3. If finderEnabled = no/unknown, show upfront: "This works only if Find My was turned on. If you see no devices listed, go straight to the next step."
  4. Lost-mode checklist (persisted in LossEvent):
     - Mark as lost / lock remotely (link back to finder service)
     - Phones: call carrier to block IMEI — show stored carrier + IMEI ready to read out
     - Police report — "Copy device summary" button (name, brand, model, serial, IMEI, photo, value)
     - Insurance — "Export PDF pack" (photos, receipt, serials, purchase info)
     - Change passwords for accounts on the device (email, banking)
Step 3: Resolution — "Found it" / "Replaced it" / "Still looking" → closes or keeps LossEvent

### 6.4 Device Detail
- All stored info, edit, "This is lost" shortcut, export single-device PDF summary

### 6.5 Settings
- Household members CRUD, export full registry as PDF, delete all data, privacy note ("All data stays on this device")

## 7. Requirements Priority

P0 (cannot ship without): registry CRUD with photos, household members, emergency mode with correct ecosystem routing, finder-enabled expectation-setting, copyable device summary, local persistence surviving app restarts.

P1 (fast follow): PDF export packs, LossEvent history, receipt photos, onboarding nudge "check that Find My is ON for each phone now — before anything is lost".

P2 (architect for, don't build): BLE proximity finder for earbuds, iCloud/local-network sync, Android port, multi-household.

## 8. Design Constraints

- Emergency mode must work for a panicking user: max one decision per screen, large touch targets, high contrast, no jargon
- Registry browsing can be information-dense; emergency mode cannot
- Light + dark mode; system font scale respected (accessibility)
- No onboarding walls — user reaches "Add device" within 2 taps of first launch

## 9. App Store Submission Checklist

- Apple Developer Program enrollment ($99/yr) — required before EAS submit
- App privacy labels: Data Not Collected (true if no analytics/network calls — keep it that way)
- App Review note: state explicitly "This app does not track location. It stores a user-entered device inventory and links to Apple's own Find My website."
- Category: Utilities or Lifestyle — NOT Kids category
- Screenshots: registry, emergency flow, recovery pack
- Support URL + privacy policy page required (single static page is fine)

## 10. Verify Before Shipping (do not skip)

- Samsung finder URL — confirm current canonical URL (SmartThings Find vs Find My Mobile)
- All finder links open correctly in iOS in-app browser AND hand off to native apps where applicable
- Google Maps Timeline is NOT included — web Timeline was deprecated; do not add it
- IMEI helper (*#06#) text is accurate for current iOS/Android

## 11. Build Order — work ONE step at a time

1. Expo project scaffold, navigation (expo-router), SQLite schema + data layer with typed queries
2. Household members + device CRUD with photos
3. Home screen + device detail
4. Emergency mode flow with ecosystem routing table
5. Lost-mode checklist + LossEvent persistence
6. Copy-summary + PDF export
7. Settings, empty states, dark mode pass
8. EAS build config, app icons, splash, privacy policy page, TestFlight build

Workflow rule: Each step must end with the app running in Expo Go / dev client and demonstrated to the human approver before moving to the next step. Do not start the next step without explicit approval. If a step fails twice, stop and explain the blocker in plain language — the approver is not a developer.

## 12. Communication Rules for the Agent

- Explain decisions in plain English, no jargon walls
- When a choice has trade-offs, present max 2 options with a recommendation
- Never silently expand scope; anything outside this spec requires approval first
- Keep a running BUILD_LOG.md: date, step, what was done, what the approver should test
