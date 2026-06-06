---
name: Firebase Auth Persistence (web vs native)
description: Platform-specific auth persistence setup to avoid AsyncStorage warning on web
---

## Rule
Use `Platform.OS` to pick the correct persistence module:
- **Web**: `browserLocalPersistence` from `firebase/auth` — survives page reloads
- **Native (iOS/Android)**: `getReactNativePersistence(AsyncStorage)` — survives app restarts

**Why:** `initializeAuth` with `getReactNativePersistence` on web causes a console warning: "You are initializing Firebase Auth for React Native without providing AsyncStorage." Even if it falls back to memory persistence, it confuses debuggers and leaves sessions non-persistent on web.

## How to apply
```ts
if (Platform.OS === "web") {
  return initializeAuth(app, { persistence: browserLocalPersistence });
}
const AsyncStorage = require("@react-native-async-storage/async-storage").default;
return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
```
Wrap in try/catch and fall back to `getAuth(app)` if anything throws (e.g. hot-reload re-initialization).
