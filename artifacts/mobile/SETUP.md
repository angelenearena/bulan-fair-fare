# Bulan FairFare — Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- Expo CLI (`npm i -g expo-cli`)
- Firebase CLI (`npm i -g firebase-tools`)
- Android Studio (for Android emulator / APK builds)
- EAS CLI (`npm i -g eas-cli`) for APK builds

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd bulan-fair-fare/artifacts/mobile
pnpm install
```

---

## 2. Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Firebase credentials from  
**Firebase Console → Project Settings → Your apps → Web app config**.

---

## 3. VS Code Setup

Open the `artifacts/mobile` folder directly in VS Code:

```bash
code .
```

Install recommended extensions when prompted (or run  
**Extensions: Show Recommended Extensions** from the command palette).

The TypeScript `baseUrl` deprecation warning is suppressed via  
`"ignoreDeprecations": "5.0"` in `tsconfig.json`.

---

## 4. Run Locally

```bash
npx expo start
# Press 'a' for Android emulator, 'i' for iOS simulator, 'w' for web
```

---

## 5. Deploy Firestore Rules & Indexes

```bash
# Login to Firebase
firebase login

# Verify project
firebase projects:list

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy composite indexes (needed for compound queries)
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage

# Deploy everything at once
firebase deploy
```

> **Important:** The Firestore rules in `firestore.rules` require the composite  
> indexes in `firestore.indexes.json` to be deployed before `My Reports` and  
> `Admin Dashboard` can load report lists with filters.

---

## 6. Build APK (Android)

```bash
# Login to EAS
eas login

# Configure EAS (first time only)
eas build:configure

# Build preview APK (no store submission)
eas build --platform android --profile preview

# Build production AAB (for Play Store)
eas build --platform android --profile production
```

The **"Made with Replit"** badge only appears in the web preview — it does NOT  
appear in the native APK.

---

## 7. Seed Official Tariff Data

After logging in as admin:
1. Go to **Profile → Admin Dashboard → Tariffs tab**
2. Tap **Load Official Routes** to seed all 56 routes from Municipal Ordinance No. 2022-21

---

## 8. Test Accounts

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | angelene.arena@sorsu.edu.ph | Confident | admin |
| Commuter | biblebuild000@gmail.com | Confidence | commuter |

---

## Stack

- **Expo SDK 54** + React Native
- **Firebase Auth** — email/password authentication
- **Firestore** — real-time database
- **Firebase Storage** — evidence photo uploads
- **Expo Router v4** — file-based navigation
- **Inter font** — via Google Fonts

## Legal Basis

- Municipal Ordinance No. 2022-21 (Bulan, Sorsogon)
- RA 9994 — Senior Citizen 20% discount
- RA 11314 — Student 20% discount
- RA 10754 — PWD 20% discount
