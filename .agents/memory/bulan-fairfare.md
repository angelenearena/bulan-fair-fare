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
