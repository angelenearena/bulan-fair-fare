---
name: Bulan FairFare
description: Key decisions and constraints for the Bulan FairFare mobile app (Expo + Firebase).
---

# Bulan FairFare — Key Decisions

## Discount Rates
Per Municipal Ordinance No. 2022-21 (official tariff document), ALL three discount sectors are 20%:
- Student: 20% (RA 11314) — NOT 15% as stated in the term paper
- Senior Citizen: 20% (RA 9994)
- PWD: 20% (RA 10754)

**Why:** The official ordinance image supersedes the term paper's stated values. Always use 20% for all three.

## Tariff Seed Data
56 official routes from Municipal Ordinance No. 2022-21 are in `services/seedData.ts`.
Fares use the ₱60.00–₱69.00 fuel price range column (current fuel index ~₱62.50).
Admin loads data via Admin Dashboard → Tariffs tab → "Load Official Routes" button.

**Why:** The app seeder uses Firestore batch writes and replaces existing tariffs, so it's idempotent.

## "Made with Replit" Badge
The badge in web preview is injected by Replit's development proxy — cannot be removed in dev mode.
The badge does NOT appear in the native APK build.

**Why:** Proxy-level injection bypasses any HTML/CSS we write. Informing the user is correct; no code fix exists for dev preview.

## APK Build
`eas.json` is configured at `artifacts/mobile/eas.json`.
Bundle identifier: `ph.gov.bulan.fairfare`
Build command: `eas build --platform android --profile preview`

## app.json
Expo Router origin reference to Replit was removed from app.json for production cleanliness.
slug changed from "mobile" to "bulan-fairfare" for proper branding.

## VS Code readiness (as of 2026-06-07)
- `tsconfig.json` uses `"ignoreDeprecations": "5.0"` to suppress baseUrl deprecation warning
- `.vscode/settings.json` + `.vscode/extensions.json` committed inside `artifacts/mobile/`
- `.env.example` template for Firebase env vars
- `SETUP.md` — full local dev + Firebase CLI deploy guide

## Firebase CLI files (artifacts/mobile/)
- `firebase.json` — points rules/indexes to local files
- `firestore.indexes.json` — composite indexes for overcharging_reports queries
- `.firebaserc` — project alias → `bulan-fair-fare`
- Deploy: `firebase deploy --only firestore:rules,firestore:indexes,storage`

## Tariff ID mapping bug fix
Always place `id: d.id` AFTER the spread `...d.data()` in Firestore map functions so document data fields
cannot overwrite the Firestore document ID. `tariffs.ts` has a shared `mapTariff()` helper that enforces this.

## Evidence upload non-blocking
ReportScreen wraps evidence upload in try/catch; if Firebase Storage upload fails, report still submits to
Firestore without `evidence_url`. Alert informs user if photo was dropped.

## Home screen fare calculator
"Quick Fare Lookup" collapsible card above route list. All locations shown in both origin AND destination
pickers (no filtering — any barangay to any barangay is selectable). For non-direct routes, through-terminal
calculation: legA (origin→Terminal) + legB (Terminal→dest) shown as combined fare with breakdown.
Both origin and destination pickers use Modal (not position:absolute overlay) for web compatibility.

## Static tariff fallback
`services/staticTariffs.ts` embeds all 56 official routes as STATIC_TARIFFS. `getTariffs()` loads from
Firestore first, then falls through to STATIC_TARIFFS if Firestore is empty or inaccessible. This ensures
the route picker always has data even if Firestore rules haven't been deployed or collection is empty.
**Why:** Firestore write rules restrict tariff creation to admins only, so non-admin users can't auto-seed.

## useAuth fallback
If Firestore `getDoc` on users/{uid} fails (permissions or offline), `useAuth` now creates a minimal AppUser
from Firebase Auth data (role: "commuter") instead of setting user=null. This prevents the form guard
(`if (!user) return`) from blocking authenticated users from submitting reports.
**Why:** Firestore rules might not be deployed, causing permission-denied errors that would silently break auth.

## Picker Modal (web fix)
All bottom-sheet pickers (route picker in ReportScreen, origin/dest pickers in HomeScreen) use React Native
`Modal` component instead of `position: "absolute"` overlay. The overlay approach gets clipped inside
scrollable containers on web; Modal renders outside the view hierarchy.

## Admin report detail screen
`screens/AdminReportDetailScreen.tsx` — full detail with: fare comparison, description, evidence photo
(Image component), status timeline (Pending→Reviewed→Resolved), status change buttons, archive button.
Route: `app/admin-report/[id].tsx` — calls `getReportById(id)` from reports service.
Admin report cards in AdminScreen are now tappable TouchableOpacity → navigates to detail screen.

## Push notifications architecture (no Cloud Functions, no billing)
- `notification_tokens/{userId}` Firestore collection — token owner can write; any auth user can read
- Mobile registers Expo push token on login via `hooks/useNotifications.ts` → `services/notifications.ts`
- On native only (Platform.OS !== "web"); gracefully no-ops on web
- On report submit: `notifyAdminsOfReport()` reads admin tokens from Firestore → calls Expo Push API directly
- Expo Push API: `POST https://exp.host/--/api/v2/push/send` — no auth required, just the push token
- Package: `expo-notifications ~0.32.17` (SDK 54 compatible via `pnpm exec expo install`)
- DO NOT use `pnpm add expo-notifications` — it installs SDK 56 version which crashes Metro

**Why:** Cloud Functions require Firebase Blaze plan. Direct client→Expo Push API approach works on free plan.
Push tokens are not true secrets (worst case: spam), so reading them for notification dispatch is acceptable.
