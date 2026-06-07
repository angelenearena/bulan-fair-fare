# Bulan FairFare
## Mobile Transportation Management Application

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.71.0-61dafb.svg)
![Firebase](https://img.shields.io/badge/Firebase-v9-ffca28.svg)

---

## 📱 About

**Bulan FairFare** is a comprehensive mobile application designed to revolutionize transportation service management in Bulan, Sorsogon. The application provides a seamless ecosystem for commuters to explore routes, access transparent fare information, and report service issues, while enabling administrators to manage tariffs and monitor system performance.

Built with **React Native (Expo)** and **Firebase**, Bulan FairFare delivers enterprise-grade functionality with a focus on user experience, security, and accessibility.

### Key Tagline
*"Fair Fares, Clear Routes, Better Rides"*

---

## 🎯 Problem Statement & Solution

### The Problem
- **Fare Inconsistency:** Commuters struggled with varying and unclear transportation fares
- **Limited Information:** Route and schedule information scattered across multiple informal sources
- **Poor Communication:** Ineffective complaint mechanisms and service feedback channels
- **Administrative Gaps:** Manual processes hindering tariff management and complaint resolution

### Our Solution
Bulan FairFare provides a unified digital platform that:
- ✓ Displays transparent, standardized fare information
- ✓ Offers comprehensive route exploration and navigation
- ✓ Enables seamless complaint filing and tracking
- ✓ Empowers administrators with system management tools
- ✓ Ensures data security and real-time synchronization

---

## 👥 Target Users

| User Type | Description | Key Features |
|-----------|-------------|--------------|
| **Commuters** | Daily transportation users | Route explorer, fare viewer, complaint filing |
| **Drivers** | Transportation service providers | Route verification, earnings tracking |
| **Administrators** | System managers | Tariff management, report review, analytics |
| **Business Users** | Commercial transportation planners | Route analysis, cost optimization |

---

## 🚀 Midterm MVP Features

**Phase 1 - Core Functionality (Completed):**

### Authentication & User Management
- [x] Email/password registration with validation
- [x] Secure Firebase Authentication
- [x] Guest mode access
- [x] User profile management
- [x] Password reset functionality
- [x] Session persistence

### Route & Fare Management
- [x] 6 transport hubs with zone categorization
- [x] 56+ transportation routes database
- [x] Real-time fare calculation engine
- [x] Passenger type pricing (Regular, Student, Senior, PWD)
- [x] Route search and filtering
- [x] Distance-based fare computation
- [x] Fuel surcharge integration

### Complaint Management System
- [x] Complaint form with validation
- [x] Photo evidence upload capability
- [x] Route and vehicle number tracking
- [x] Amount comparison (charged vs. expected)
- [x] Status tracking (Pending, Reviewed, Resolved)
- [x] Complaint history view

### User Interface
- [x] Responsive mobile design
- [x] Bottom tab navigation
- [x] Clean, intuitive layouts
- [x] Loading states and error handling
- [x] Form validation feedback
- [x] Real-time data synchronization

### Administrative Features
- [x] Admin dashboard access control
- [x] Tariff management panel
- [x] Report review system
- [x] Settings configuration
- [x] Route management interface

---

## 🛠️ Technology Stack

### Frontend
- **React Native (Expo)** - Cross-platform mobile development
- **React Navigation** - Stack and bottom-tab navigation
- **React Hooks** - State management with useState, useEffect, useContext
- **AsyncStorage** - Local data persistence

### Backend & Services
- **Firebase Authentication** - Secure user authentication
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Storage** - Image and media storage
- **Firebase Security Rules** - Database access control

### Development Tools
- **EAS Build** - Expo Application Services for APK building
- **Git & GitHub** - Version control and collaboration
- **Android Studio** - Emulator and debugging
- **Visual Studio Code** - Development environment

### Dependencies (Key Packages)
```json
{
  "react-native": "0.71.0",
  "expo": "^48.0.0",
  "firebase": "^9.23.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "@react-native-async-storage/async-storage": "^1.17.0",
  "expo-camera": "^13.2.0",
  "expo-notifications": "^0.17.0"
}
```

---

## 📊 Firestore Collections Overview

### 1. **users** Collection
Stores authenticated user information and profile data.

```javascript
{
  uid: "user_auth_id",
  name: "Maria Santos",
  email: "maria@example.com",
  phone: "+63-912-345-6789",
  userType: "commuter",
  isAdmin: false,
  joinedDate: "2026-05-20T10:30:00Z",
  reportCount: 5,
  profilePicture: "gs://bucket/users/profile.jpg"
}
```

### 2. **routes** Collection
Contains transportation route information.

```javascript
{
  routeId: "route_001",
  origin: "Bulan Poblacion (Terminal)",
  destination: "Inararan",
  distanceKm: 3.5,
  baseFare: 15.00,
  perKmRate: 2.5,
  status: "active",
  hubOrigin: "Poblacion",
  hubDestination: "Northern Zone",
  createdAt: "2026-05-01T00:00:00Z"
}
```

### 3. **fares** Collection
Dynamic fare calculation data by passenger type.

```javascript
{
  fareId: "fare_001",
  routeId: "route_001",
  passengerType: "regular",
  amount: 18.00,
  breakdown: {
    baseFare: 15.00,
    perKmCost: 8.75,
    fuelSurcharge: 0.85
  },
  effectiveDate: "2026-06-01T00:00:00Z",
  status: "active"
}
```

### 4. **reports** Collection
User complaints and service issue tracking.

```javascript
{
  reportId: "report_001",
  userId: "user_uid",
  userName: "Maria Santos",
  route: "Bulan Poblacion → Inararan",
  bodyNumber: "0456",
  amountCharged: 20.00,
  expectedFare: 18.00,
  description: "Driver overcharged",
  category: "overcharging",
  photoUrls: ["gs://bucket/reports/photo1.jpg"],
  status: "pending",
  createdAt: "2026-06-01T14:30:00Z",
  resolvedAt: null
}
```

### 5. **hubs** Collection
Transportation hub locations and information.

```javascript
{
  hubId: "hub_001",
  name: "Poblacion",
  zone: "Zone 1-4",
  description: "Municipal center & main terminal",
  icon: "location_pin",
  activeRoutes: 15,
  operatingHours: "5:00 AM - 9:00 PM"
}
```

---

## 🔐 Security & Firebase Configuration

### Firestore Security Rules (Summary)

```javascript
// Users can only access their own documents
allow read, write: if request.auth.uid == userId;

// Routes and fares are publicly readable
allow read: if true;

// Only admins can modify system data
allow write: if hasRole('admin');

// Reports accessible by owner or admin
allow read: if request.auth.uid == userId || hasRole('admin');
```

### Environment Configuration

**Create `.env.local` file:**
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Firebase Configuration in Code:**
```javascript
// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Note:** Never commit Firebase credentials to version control!

---

## 📲 Setup Instructions

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Android SDK** (for emulator testing)
- **Git** for version control

### Installation Steps

**1. Clone Repository**
```bash
git clone https://github.com/[your-username]/bulan-fairfare.git
cd bulan-fairfare
```

**2. Install Dependencies**
```bash
npm install
# or
yarn install
```

**3. Configure Firebase**
- Create Firebase project at https://console.firebase.google.com
- Copy configuration credentials
- Create `.env.local` file with credentials
- Enable Firestore Database
- Enable Authentication (Email/Password)
- Set up Security Rules

**4. Run Development Server**
```bash
expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on physical device

**5. Build APK (Production)**
```bash
# Login to Expo account
eas login

# Configure EAS
eas build:configure

# Build APK
eas build --platform android --profile production

# Monitor build progress
eas build --platform android --status
```

---

## 🗂️ Project Architecture

### Folder Structure

```
bulan-fairfare/
├── src/
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── FairFareScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── ReportScreen.js
│   │   └── AdminScreen.js
│   │
│   ├── components/        # Reusable components
│   │   ├── Header.js
│   │   ├── RouteCard.js
│   │   ├── FareCard.js
│   │   ├── ReportForm.js
│   │   └── LoadingSpinner.js
│   │
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── BottomTabNavigator.js
│   │
│   ├── services/          # Firebase and API services
│   │   ├── firebaseService.js
│   │   ├── authService.js
│   │   ├── routeService.js
│   │   └── reportService.js
│   │
│   ├── context/           # React Context for state
│   │   ├── AuthContext.js
│   │   └── AppContext.js
│   │
│   ├── utils/             # Utility functions
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── helpers.js
│   │
│   └── config/            # Configuration files
│       └── firebase.js
│
├── assets/                # Images, icons, fonts
├── __tests__/             # Test files
├── app.json               # Expo configuration
├── eas.json               # EAS build configuration
├── package.json           # Dependencies
├── .env.local             # Environment variables (not committed)
├── .gitignore
├── README.md
└── LICENSE
```

### State Management Approach

**Context API with Hooks** (Lightweight alternative to Redux)

```javascript
// context/AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Firebase authentication logic
  };

  const logout = async () => {
    // Sign out logic
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Usage in Components:**
```javascript
function ProfileScreen() {
  const { user } = useAuth();
  
  return <Text>{user.name}</Text>;
}
```

---

## 📸 App Screenshots

### Midterm Phase Screenshots

**Screen 1: Explore/Home Screen**
- Grid layout with 6 transport hubs
- Network statistics card (56 routes, 6 hubs, ₱9 minimum fare)
- Bottom navigation bar with 5 main tabs
- Features icon-based hub selection

**Screen 2: Login Screen**
- Email and password input fields
- Form validation with error messages
- Sign-up link for new users
- Modern UI with app branding

**Screen 3: FairFare (Routes & Pricing)**
- Search origin-destination functionality
- Route list with distance information
- Passenger type selector (4 options with discounts)
- Dynamic fare display with breakdown
- Shows: Base Fare, Distance Cost, Fuel Surcharge, Total

**Screen 4: Report Screen**
- Route selection dropdown
- Body number/vehicle ID input
- Amount charged vs. expected comparison
- Description text area for complaint details
- Photo upload from gallery
- Form validation before submission

**Screen 5: Profile Screen (Logged-in User)**
- User avatar and name display
- Account statistics (Orders, Reviews, Saves)
- Account settings section
- Change password option
- Notifications preferences
- Order history link
- Sign-out button

**Screen 6: Admin Dashboard**
Three tabs:
1. **Reports Tab:** Complaint list with status filters (Pending, Reviewed, Resolved)
2. **Tariffs Tab:** Route-wise fare management with edit capabilities
3. **Settings Tab:** Global parameter configuration (Base Fare, Per-KM Rate, Fuel Index)

**Screen 7: My Reports/History**
- Complaint status timeline
- Report details with metadata
- Resolution notes and status tracking
- Filter and search capabilities

**Screen 8: Profile (Guest Mode)**
- Sign-in prompt
- Basic app information
- Public feature access message

### Midterm Phase Feature Demonstration

- ✓ Authentication flow (login/signup/logout)
- ✓ Route exploration across 6 zones
- ✓ Real-time fare calculation
- ✓ Complaint filing with photo evidence
- ✓ Admin tariff management
- ✓ User profile management
- ✓ Real-time Firestore synchronization
- ✓ Form validation and error handling
- ✓ Loading states and empty states
- ✓ Responsive mobile layout

---

## 🧪 Testing & Validation

### Test Coverage Summary

**Total Test Cases:** 20  
**Pass Rate:** 100% (20/20)  
**Testing Period:** May 15 - June 5, 2026  

### Test Categories

| Category | Test Count | Pass Rate |
|----------|-----------|-----------|
| Authentication | 4 | 100% |
| Route Management | 3 | 100% |
| Fare Calculation | 2 | 100% |
| Report System | 3 | 100% |
| User Profile | 2 | 100% |
| Admin Functions | 3 | 100% |
| Real-time Sync | 1 | 100% |
| Performance | 1 | 100% |

### Key Test Results

✓ **Authentication:** All login/signup scenarios pass  
✓ **Real-time Data:** Firestore synchronization confirms instant updates  
✓ **Fare Accuracy:** Calculations match expected results within 100% accuracy  
✓ **UI Responsiveness:** Layout adapts correctly across screen sizes  
✓ **Performance:** App loads in < 3 seconds  
✓ **Data Persistence:** AsyncStorage caching works reliably  

### Performance Benchmarks

| Metric | Target | Achieved |
|--------|--------|----------|
| App Launch Time | < 3s | 2.8s ✓ |
| Route Loading | < 2s | 1.5s ✓ |
| Fare Calculation | < 1s | 0.8s ✓ |
| Image Upload | < 5s | 3.2s ✓ |
| Memory Usage | < 150MB | 128MB ✓ |

---

## 🚀 Build & Deployment Instructions

### Building APK

**Method 1: Using EAS (Recommended)**

```bash
# Install EAS CLI
npm install -g eas-cli

# Authenticate
eas login

# Build APK
eas build --platform android --profile production

# Output: Download link to .apk file
```

**Method 2: Using Android Studio**

```bash
# Generate key for signing
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias release

# Build signed APK
./gradlew assembleRelease
```

### Installing on Device

1. Download APK from build link
2. Transfer to Android phone via USB
3. Enable "Unknown Sources" in Security settings
4. Open file manager and tap APK file
5. Grant permissions and install
6. Launch app and create account

### App Configuration

| Setting | Value |
|---------|-------|
| App Name | Bulan FairFare |
| Version | 1.0.0 |
| Minimum Android | 9.0 (API 28) |
| Target Android | 13 (API 33) |
| Package Name | com.sorsu.fairfare |
| File Size | ~45MB |

---

## 📚 Development Guide

### Creating New Features

**1. Add Screen Component**
```javascript
// src/screens/NewScreen.js
import { View, Text } from 'react-native';

export default function NewScreen() {
  return (
    <View>
      <Text>New Feature</Text>
    </View>
  );
}
```

**2. Register in Navigation**
```javascript
// Update BottomTabNavigator.js
<Tab.Screen name="NewTab" component={NewScreen} />
```

**3. Add Firestore Service**
```javascript
// src/services/newFeatureService.js
export const fetchData = async () => {
  const collection = await getDocs(
    query(db, 'collection_name')
  );
  return collection.docs.map(doc => doc.data());
};
```

**4. Implement in Screen**
```javascript
useEffect(() => {
  const loadData = async () => {
    const data = await fetchData();
    setData(data);
  };
  loadData();
}, []);
```

---

## 🤝 Contributing Guidelines

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes with clear messages (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request with detailed description

### Code Style

- Use ESLint for consistent formatting
- Follow React best practices
- Write descriptive variable names
- Add comments for complex logic
- Test before committing

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors & Contributors

**Development Team:**
- [Student Name 1] - Full Stack Development
- [Student Name 2] - Backend & Firebase
- [Student Name 3] - Frontend & UI/UX

**Supervised By:**
- Ms. Ceilo Gabotero, ADET2 Course Instructor

**Special Thanks To:**
- Sorsogon State University CICT Department
- Firebase Community
- React Native Community

---

## 📞 Support & Contact

**For Issues & Questions:**
- GitHub Issues: [Create an issue](https://github.com/[your-username]/bulan-fairfare/issues)
- Email: [your-email@example.com]
- Discord: [Join our community]

**Project Links:**
**Project Links:**
- 🔗 [Live Demo APK](https://expo.dev/artifacts/eas/kR2qiMZPSefjiGdqnxPy5F.aab)
- 📁 [GitHub Repository](https://github.com/angelenearena/bulan-fair-fare)
- 📖 [Full Documentation](https://github.com/angelenearena/bulan-fair-fare/tree/main/docs)

---

## 📋 Roadmap

### ✅ Completed (v1.0.0)
- User authentication and profiles
- Route exploration system
- Fare calculation engine
- Report/complaint management
- Admin dashboard
- Real-time synchronization

### 🔄 In Progress (v1.1.0)
- Push notifications system
- Advanced analytics dashboard
- Payment gateway integration
- Offline mode enhancement

### 📅 Planned (v2.0.0)
- iOS platform support
- Driver mobile app
- Real-time tracking
- Predictive analytics
- Multi-language support
- Web administration portal

---

## ⭐ Show Your Support

If you found this project helpful, please consider:
- ⭐ Giving it a star on GitHub
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing to the project

---

**Last Updated:** June 7, 2026  
**Current Version:** 1.0.0  
**Status:** ✅ Production Ready

---

*Built with ❤️ by the Sorsogon State University ADET2 Class*
