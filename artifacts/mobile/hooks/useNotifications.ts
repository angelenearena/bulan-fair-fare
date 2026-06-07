import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { getExpoPushToken, savePushToken } from "../services/notifications";
import { AppUser } from "../types";

/**
 * Requests notification permission, gets the Expo push token,
 * and saves it to Firestore so admins can be notified.
 *
 * Safe to call unconditionally — silently no-ops on web and when
 * permission is denied.
 */
export function useNotifications(user: AppUser | null): void {
  const registered = useRef(false);

  useEffect(() => {
    // Only native devices get push token registration
    if (Platform.OS === "web") return;
    if (!user) {
      registered.current = false;
      return;
    }
    if (registered.current) return;

    async function registerToken() {
      try {
        const token = await getExpoPushToken();
        if (token && user) {
          await savePushToken(user.uid, user.role, token);
          registered.current = true;
        }
      } catch {
        // Silent fail — non-critical
      }
    }

    registerToken();
  }, [user]);
}
