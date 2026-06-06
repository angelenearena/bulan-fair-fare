# Bulan FairFare

Official municipal public transport fare transparency mobile application for Bulan, Sorsogon.

**Version:** 1.0.0  
**Platform:** Android & iOS (Expo SDK 54)  
**Legal Basis:** Municipal Ordinance No. 2022-21

---

## Problem Statement

Commuters in Bulan, Sorsogon face arbitrary tricycle overcharging, ambiguous manual discount calculations, and no formal channel to report fare anomalies. Bulan FairFare solves this by providing a transparent, digital fare reference and a structured complaint system.

## Target Users

| User | Description |
|------|-------------|
| **Guest** | Public browsing of fare matrix — no login required |
| **Commuter** | Authenticated user who can file overcharging reports |
| **Admin (LGU)** | Transport official who manages routes, settings, and resolves complaints |

---

## Midterm MVP Features

- 6+ screens: Home, Explore, Route Detail, Report, My Reports, Profile, Auth, Admin
- Public tariff directory — no login required
- Fare calculator with sector discounts (Regular / Student / Senior / PWD)
- Firebase Authentication: register, login, logout
- Firestore CRUD: create and view reports
- Loading skeletons, empty states, error feedback, form validation

## Final Product Additions

- **Granular RBAC** — guest / commuter / admin role enforcement throughout
- **AI auto-tagging** — rule-based keyword parser assigns infraction tags (Fare Overcharge, Driver Misconduct, Reckless Driving) to reports
- **Real-time sync** — Firestore `onSnapshot` bindings update admin queue and commuter history instantly
- **Soft archiving** — admin uses `is_archived: true` flag, never hard-deletes records
- **Official tariff seeding** — 56 routes from Municipal Ordinance No. 2022-21 loadable directly from Admin panel

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React Native (Expo SDK 54) | Cross-platform mobile framework |
| Expo Router | File-based navigation (Stack + Tabs) |
| Firebase Authentication | Email/password auth + role assignment |
| Firebase Firestore | NoSQL real-time cloud database |
| TypeScript | Type safety |
| Lucide/Feather Icons | Iconography |

---

## Folder Structure

```
artifacts/mobile/
├── app/                    # Expo Router routing layer
│   ├── (tabs)/             # Bottom tab screens
│   ├── route/[id].tsx      # Route detail (Stack)
│   ├── auth.tsx            # Auth gateway (modal)
│   └── admin.tsx           # Admin dashboard
├── screens/                # Core view modules
├── components/             # Reusable UI elements
├── services/               # Firebase Firestore queries
├── hooks/                  # Custom React hooks
├── context/                # AuthContext (global auth state)
├── types/                  # TypeScript interfaces & schemas
└── constants/              # Theme colors
```

---

## Firestore Collections

### `users`
```json
{
  "name": "string",
  "email": "string",
  "role": "commuter | admin",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `tariffs`
```json
{
  "origin": "Bulan Poblacion (Terminal)",
  "destination": "string",
  "distance_km": "number",
  "fares": {
    "regular": "number",
    "student": "number",
    "senior": "number",
    "pwd": "number"
  },
  "body_numbers": ["string"],
  "description": "string",
  "ordinance": "Municipal Ordinance No. 2022-21",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `overcharging_reports`
```json
{
  "user_id": "string",
  "body_number": "string",
  "origin": "string",
  "destination": "string",
  "legal_fare": "number",
  "extorted_fare": "number",
  "description": "string",
  "ai_tags": ["Fare Overcharge | Driver Misconduct | Reckless Driving"],
  "status": "Pending | Reviewed | Resolved",
  "is_archived": "boolean",
  "incident_date": "Timestamp",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `global_settings`
```json
{
  "base_fare": 15.00,
  "per_km_rate": 2.50,
  "minimum_fare": 10.00,
  "fuel_price_index": 62.50,
  "updated_by": "admin_uid",
  "updatedAt": "Timestamp"
}
```

---

## Discount Rates (Per Ordinance)

| Sector | Discount | Legal Basis |
|--------|----------|-------------|
| Regular | 0% | — |
| Student | 20% | RA 11314 |
| Senior Citizen | 20% | RA 9994 |
| PWD | 20% | RA 10754 |
| Pre-school | Free | Section 5(d)(e) of Ordinance |

---

## Firebase Security Rules Summary

```js
// Tariffs & Global Settings: public read, admin-only write
// Users: read/write own document only; admin can read all
// Overcharging Reports: authenticated create; own read; admin full access
```

---

## Privacy Statement

The application collects: user email, display name, role assignment, and submitted incident reports. Data is stored in Firebase Firestore (Google infrastructure). Commuter reports are accessible only to the submitting user and LGU administrators. No data is sold or shared with third parties. Users may contact the LGU to request data deletion.

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- pnpm
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Environment Variables
Create environment secrets for:
```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

### Development
```bash
pnpm --filter @workspace/mobile run dev
```

### Build APK (via EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build preview APK
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production
```

### Load Official Tariff Data
1. Sign in as an admin user in the app
2. Go to **Profile → Admin Dashboard**
3. Select the **Tariffs** tab
4. Tap **Load Official Routes** to import all 56 routes from Municipal Ordinance No. 2022-21

---

## Manual Test Cases

| ID | Description | Expected | Status |
|----|-------------|----------|--------|
| TC-01 | Guest views tariff directory | Routes load without login | ✅ |
| TC-02 | Search "Sabang" in home | Filters matching routes | ✅ |
| TC-03 | Select Senior in fare calculator | Shows 20% discount applied | ✅ |
| TC-04 | Guest accesses Report tab | Redirected to login prompt | ✅ |
| TC-05 | Register new commuter account | Session persists after restart | ✅ |
| TC-06 | Submit overcharge report | Document created in Firestore | ✅ |
| TC-07 | Enter "rude behavior" in report | Auto-tags "Driver Misconduct" | ✅ |
| TC-08 | Commuter views My Reports | Real-time list updates instantly | ✅ |
| TC-09 | Commuter accesses admin route | Access denied | ✅ |
| TC-10 | Admin updates report to Resolved | Status syncs for all users | ✅ |
