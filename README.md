
---

```markdown
# Bulan FairFare

[cite_start]**Build Status**: ✅ Stable Release (v1.0.0) [cite: 145]  
[cite_start]**Platform**: Cross-Platform Mobile (Android & iOS Compatible via Expo SDK 54) [cite: 4]  
[cite_start]**Database/Backend**: Firebase Firestore (NoSQL) & Firebase Authentication [cite: 18, 19]  
**Theme**: High-Contrast Black & Pink (Day/Night Optimized UI)  
[cite_start]**Academic Affiliation**: Sorsogon State University (SorSU) — Bulan Campus [cite: 96]  
[cite_start]**Development Team**: Angelene C. Arena & Bart Jayson S. Lola [cite: 96]  

---

## Project Overview

[cite_start]**Bulan FairFare** is a municipal public transport fare transparency mobile application engineered specifically for the commuting public and transport management of Bulan, Sorsogon[cite: 9]. [cite_start]The platform addresses arbitrary tricycle overcharging, eliminates the friction of manual discount computations, and offers localized visibility over official tricycle commuter tariff structures[cite: 11].

### Problem Statement
* [cite_start]**Arbitrary Tariff Overcharging**: Lack of visible or immediate access to authorized municipal fare matrices leads to inconsistent pricing by public transport drivers[cite: 11].
* [cite_start]**Ambiguous Manual Calculations**: Regular manual updates for mandatory sector discounts (Students, Senior Citizens, and PWDs) are prone to disagreement and miscalculation[cite: 11].
* [cite_start]**Absence of Accountability Systems**: Commuters lack a formalized, immediate, and structured channel to document, categorize, and submit fare anomalies directly to administrative bodies[cite: 11].

### [cite_start]Target Users [cite: 12]
1. [cite_start]**Guests (Unauthenticated Commuters)**: General public needing instant route browsing, lookup, and fare estimation tools[cite: 34, 49].
2. [cite_start]**Commuters (Authenticated Users)**: Local travelers who can file formal overcharging reports and securely review their submission histories[cite: 36, 41].
3. [cite_start]**Admins (Transport Officials/Regulators)**: Local authority accounts responsible for resolving reports, managing official route rates, and setting core metric factors[cite: 116, 170].

---

## [cite_start]Tech Stack & Architecture Standards [cite: 15]

* [cite_start]**Frontend Framework**: React Native (Expo SDK 54) with TypeScript [cite: 17]
* [cite_start]**Routing & Navigation**: Expo Router (Native File-Based App Routing & Stacks) [cite: 27, 56]
* [cite_start]**Database Engine**: Firebase Firestore (NoSQL Document Store) [cite: 18]
* [cite_start]**Authentication Layer**: Firebase Auth (Secure Client Token-Based Access) [cite: 19]
* **Iconography**: Lucide React Native / Expo Vector Icons
* **Styling Architecture**: React Native Native StyleSheet
* [cite_start]**Native Module Hooks**: Expo Location, Expo LocalAuthentication (Biometrics) [cite: 129]

---

## [cite_start]Folder Structure Separation [cite: 177, 178]

[cite_start]In alignment with the structural development requirements of the course, presentation logic, view routing, database mutation services, and data modeling boundaries are strictly partitioned[cite: 175]:

```text
 project-root/
 [cite_start]├── app/                      # EXPO ROUTER ROUTING LAYER [cite: 178]
 [cite_start]│   ├── (tabs)/               # Tab-based primary interfaces [cite: 58]
 [cite_start]│   │   ├── _layout.tsx       # Bottom tab shell configuration [cite: 58]
 [cite_start]│   │   ├── index.tsx         # Mounts and returns <HomeScreen /> [cite: 49]
 [cite_start]│   │   ├── explore.tsx       # Mounts and returns <ExploreScreen /> [cite: 50]
 [cite_start]│   │   ├── report.tsx        # Mounts and returns <ReportScreen /> [cite: 52]
 [cite_start]│   │   ├── my-reports.tsx    # Mounts and returns <MyReportsScreen /> [cite: 41]
 [cite_start]│   │   └── profile.tsx       # Mounts and returns <ProfileScreen /> [cite: 54]
 │   ├── route/                # Nested parameter routing
 [cite_start]│   │   └── [id].tsx          # Mounts and returns <RouteDetailScreen /> [cite: 51, 57]
 [cite_start]│   ├── auth.tsx              # Full-screen Authentication Gateway [cite: 70]
 [cite_start]│   ├── admin.tsx             # Dedicated Admin Dashboard interface [cite: 116]
 │   └── _layout.tsx           # Context providers and root navigation container
 [cite_start]├── screens/                  # CORE ARCHITECTURE VIEW MODULES [cite: 178]
 [cite_start]│   ├── HomeScreen.tsx        # Tariff browsing interface [cite: 49]
 [cite_start]│   ├── ExploreScreen.tsx     # Route map and hub visualization [cite: 50]
 [cite_start]│   ├── RouteDetailScreen.tsx # Fare compilation and calculator matrix [cite: 51]
 [cite_start]│   ├── ReportScreen.tsx      # Formal overcharge submission interface [cite: 52]
 [cite_start]│   ├── MyReportsScreen.tsx   # Authenticated personalized entry timeline [cite: 41]
 [cite_start]│   ├── ProfileScreen.tsx     # Session management and role entry portals [cite: 54]
 [cite_start]│   └── AdminScreen.tsx       # Admin queue triage and parameters dashboard [cite: 116]
 [cite_start]├── components/               # DECOUPLED REUSABLE UI ELEMENTS [cite: 178]
 │   ├── Button.tsx            # Standardized UI action element
 │   ├── TariffCard.tsx        # Route item display block
 │   ├── ReportItem.tsx        # Status tracking row view
 [cite_start]│   └── LoadingSkeleton.tsx   # Content placeholder for layout loading state [cite: 79]
 [cite_start]├── services/                 # PURE FIREBASE FIRESTORE DATA QUERIES [cite: 178]
 [cite_start]│   ├── firebase.ts           # Client SDK App Initialization [cite: 16]
 [cite_start]│   ├── tariffs.ts            # Tariff collection document hooks & CRUD [cite: 60]
 [cite_start]│   ├── reports.ts            # Incident report document streams & CRUD [cite: 60]
 [cite_start]│   └── settings.ts           # Global parameter collection handlers [cite: 60]
 [cite_start]├── hooks/                    # CUSTOM UTILITY REACT HOOKS [cite: 178]
 [cite_start]│   ├── useAuth.ts            # Wrapper around user persistence state [cite: 70]
 [cite_start]│   └── useDebounce.ts        # Optimization for text searches [cite: 67]
 [cite_start]└── types/                    # STRICT TS INTERFACES & SCHEMAS [cite: 178]
     └── index.ts              # System entity type declarations

```

---

Feature Matrix: Midterm vs. Final Product 

Midterm MVP Features (Core Deliverables) 

* 
**6+ Compliant Native Screens**: Structural partition across Tariff Search, Route Details, Incident Reporting, Personalized Timelines, Dashboard Panels, and Authorization gateways.


* **Stateless Fare Engine**: Calculator supporting sector selection matrix (Standard, Student, Senior, PWD).
* 
**Public-Facing Guest Mode**: Free access to core tariff searches and route parameters without demanding initial profile entry blocks.


* 
**Basic Firebase Authentication**: Email-and-password registration, sign-in persistence listeners, and logout flows.


* 
**Firestore Content Instantiation**: Dynamic loading and viewing profiles across standard Firestore collections.


* 
**UI State Framework**: Configured loading spinners, feedback alerts, form checking, and empty-state fallbacks.



Final Production Additions 

* 
**Granular Role-Based Access Control (RBAC)**: Enforced system mapping split among guest, commuter, and admin claims.


* 
**AI-Assisted Context Auto-Tagging**: Heuristic rule-based categorization evaluating commuter entry strings during report generation to tag matching infractions (Fare Overcharge, Driver Misconduct, Reckless Driving).


* 
**Real-Time Synchronous Binding**: Bi-directional data pipeline bindings using `onSnapshot` queries to auto-update data lists across admin dashboards and commuter history items instantly.


* 
**Soft-Archiving Implementations**: Administrative record management processing document status alterations utilizing internal flags (`is_archived: true`) instead of permanent document drops.



---

Native Device Features (Final Build Integration) 

To fulfill advanced edge-integration criteria, the final layout deploys two explicit hardware capabilities:

1. 
**Geolocation API (`expo-location`)**: Automatically grabs the user's localized coordinates when filing an overcharging report. This validates that the report is accurately originating within the territorial boundaries of Bulan, Sorsogon, avoiding spam reports.


2. 
**Local Authentication / Caching (`expo-local-authentication`)**: Offers optional hardware biometrics (Fingerprint/Face ID) to secure entry into the admin dashboard pane and caches local historical tariff data for fast offline lookup.



---

Privacy & Data Protection Statement 

In alignment with strict data management compliance, **Bulan FairFare** enforces a transparent privacy structure:

* 
**Data Collection Scope**: The application strictly gathers minimal identifying information: user electronic mail addresses (for credentials verification) and fine geographic coordinates (exclusively requested during overcharge incident submittals).


* 
**Purpose of Collection**: Account credentials verify personal timeline query logs. Geographic coordinates securely corroborate transport policy enforcement directly to local regulators, ensuring false filings are systematically filtered out.


* 
**Security & Retention Policy**: All operational payloads are safeguarded via Firestore Security rules. No profiling data is sold, exchanged, or transmitted to outside third parties. Users maintain explicit control to request immediate, unrecoverable account purging directly through their profiles.



---

Firestore Data Modeling Schema 

### Collections & Document Blueprint Structures

`users` (Collection) 

```json
// Document ID: [Firebase Auth User UID]
{
  "name": "Arena_Lola",
  "email": "commuter@test.com",
  "role": "commuter", // 'guest' | 'commuter' | 'admin'
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}

```

`global_settings` (Collection) 

```json
// Document ID: "current_rates"
{
  "base_fare": 15.00,
  "per_km_rate": 2.50,
  "minimum_fare": 10.00,
  "fuel_price_index": 62.50,
  "updated_by": "admin_uid_string",
  "updatedAt": "Timestamp"
}

```

`tariffs` (Collection) 

```json
// Document ID: [Auto-Generated UUID]
{
  "origin": "Bulan Zone 4 (Poblacion)",
  "destination": "San Francisco (Sabang)",
  "distance_km": 4.8,
  "fares": {
    "regular": 27.00,
    "student": 23.00,
    "senior": 21.50,
    "pwd": 20.25
  },
  "body_numbers": ["0123", "0456", "0789"],
  "description": "Primary corridor via Maharlika Highway route",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}

```

`overcharging_reports` (Collection) 

```json
// Document ID: [Auto-Generated UUID]
{
  "user_id": "commuter_uid_string",
  "body_number": "0456",
  "origin": "Bulan Zone 4 (Poblacion)",
  "destination": "San Francisco (Sabang)",
  "legal_fare": 27.00,
  "extorted_fare": 40.00,
  "description": "Driver insisted on 40 pesos claiming night surcharge applied.",
  "ai_tags": ["Fare Overcharge", "Driver Misconduct"],
  "status": "Pending", // 'Pending' | 'Reviewed' | 'Resolved'
  "is_archived": false,
  "incident_date": "Timestamp",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}

```

---

Firebase Security Rules Summary 

The production database is strictly locked down using standard Firebase Security Rules to control collection access based on authentication status and verified user roles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Settings & Tariff Rules: Read access is global; structural changes require admin flags
    match /global_settings/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /tariffs/{document} {
      allow read: if true;
      allow write: if request.auth != null && get(/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User Profile Access Rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && get(/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Overcharging Incident Report Processing Rules
    match /overcharging_reports/{reportId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (resource.data.user_id == request.auth.uid || get(/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update, delete: if request.auth != null && get(/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}

```

---

## App Mechanics & Formula Engines

### Computational Fare Formulation Blueprint

$$\text{Subtotal} = \text{Base Fare} + (\text{Distance (km)} \times \text{Per-KM Rate}) + \text{Fuel Surcharge}$$

$$\text{Final Commuter Fare} = \text{Subtotal} \times (1 - \text{Sector Discount Rate})$$

* **Sector Discount Assignments**: Regular (0%), Student (15%), Senior Citizen (20%), PWD (25%).

Semantic Auto-Tagging Engine Flow 

User text entry triggers string parsing to capture municipal infraction keywords during submission:

* `overcharge` / `singil` / `mahal` $\rightarrow$ **Fare Overcharge**
* `bastos` / `away` / `rude` $\rightarrow$ **Driver Misconduct**
* `mabilis` / `harurot` / `dangerous` $\rightarrow$ **Reckless Driving**

---

Step-By-Step Installation & Project Initialization 

### 1. Prerequisite Environments

Ensure you have the following software installed locally:

* **Node.js**: v18.x or newer LTS configurations
* **Package Manager**: npm (packaged natively alongside Node)
* **Global Interfaces**: Expo CLI toolchains

### 2. Dependency Resolution Layout

Clone this project directory, enter the root workspace path, and run the dependency loader:

```bash
# Clone or access the project working directory
cd BulanFairFare

# Install standard matching system dependencies
npm install

```

3. Environment Variable Security Arrangement (`.env`) 

Create a secure `.env` key storage file at your project root to handle system access parameters. Never commit this file to your public repository branch:

```text
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K_ExampleKey
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=bulan-fairfare.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=bulan-fairfare
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=bulan-fairfare.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k

```

### 4. Direct Execution Engine Commands

```bash
# Start your local Expo development bundler
npx expo start

# Optional targeted triggers:
# Press 'a' in your terminal window for Android virtual device mapping
# Press 'w' in your terminal window to run a browser-based preview

```

5. Compiling Production Builds via EAS 

To bundle your verified codebase into a shareable Android Package file (APK) natively:

```bash
# Install the EAS command-line tools globally
npm install -g eas-cli

# Log into your Expo developer platform account
eas login

# Initialize configuration parameters and trigger a cloud build execution
eas build:configure
eas build --platform android --profile preview

```

---

Application Assets & Production Media Links 

### 📦 Executable Deployment Distributions

* **Live Expo Go Sandbox Project View**: [Deploy Link via Expo Dev](https://www.google.com/search?q=https://expo.dev/%40your-username/bulan-fairfare) *(Replace with your real link)*
* **Direct Android APK Production Download**: [Google Drive Secure Cloud Binary Storage](https://drive.google.com/open?id=your-apk-id) *(Replace with your real link)*

📱 Interface Interaction Screenshots 

| 1. Home / Search Grid 

 | 2. Dynamic Matrix Results 

 | 3. Hub Explore Map 

 |
| --- | --- | --- |
|  |  |  |

| 4. Security Auth Layer 

 | 5. File Grievance Report 

 | 6. User Personal History 

 |
| --- | --- | --- |
|  |  |  |

| 7. Administration Triage 

 | 8. Parameter Settings Panel 

 | 9. Validation Fallback 

 | 10. Blank Array Layout 

 |
| --- | --- | --- | --- |
|  |  |  |  |

---

Manual Validation Test Cases (Course Audit Log) 

| Test Identifier | System Testing Target Module | Step Sequence Operations | Intended Verification Response | Assessment Status |
| --- | --- | --- | --- | --- |
| **TC-01** | Stateless Directory Lookup | Access app instance without entering credentials.

 | App lists available local routes and stops seamlessly.

 | ✅ SUCCESS |
| **TC-02** | Search Filter Refinement | Enter targeted query string "Sabang".

 | View filters collection rows to match requested route entry. | ✅ SUCCESS |
| **TC-03** | Structural Fare Processing | Choose Senior configuration option inside calculator. | App processes price calculation showing a 20% discount. | ✅ SUCCESS |
| **TC-04** | Auth Gateway Controls | Attempt to access the Report tab from guest view.

 | System interrupts workflow, redirecting user to Login page.

 | ✅ SUCCESS |
| **TC-05** | Core Auth Persistence | Process fresh user entry schema through register.

 | Session initializes and maintains status across restarts. | ✅ SUCCESS |
| **TC-06** | Firestore Data Creation | Complete overcharging form fields and hit send.

 | Document uploads directly into the NoSQL Firestore schema.

 | ✅ SUCCESS |
| **TC-07** | Local Context Auto-Tagging | Enter entry phrase matching "rude behavior".

 | The system auto-assigns "Driver Misconduct" string tags.

 | ✅ SUCCESS |
| **TC-08** | Real-Time Stream Sync | Access personalized reporting dashboard list views.

 | Fresh Firestore data mutations sync downstream automatically.

 | ✅ SUCCESS |
| **TC-09** | Enforced RBAC Privileges | Sign in using a standard Commuter user profile account.

 | Core system blocks unauthorized entry to Admin interfaces.

 | ✅ SUCCESS |
| **TC-10** | Admin Data Modification | Toggle an active incident report item to 'Resolved'.

 | Database collection status updates instantly for everyone.

 | ✅ SUCCESS |

```

```
