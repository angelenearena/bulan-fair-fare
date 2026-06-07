import { Platform } from "react-native";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

const TOKENS_COLLECTION = "notification_tokens";

/**
 * Get Expo push token for this device.
 * Returns null on web (no Expo push token available on web).
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const Notifications = await import("expo-notifications");
    const Device = await import("expo-device");

    if (!Device.default.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("reports", {
        name: "Overcharging Reports",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF2D78",
        sound: "default",
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

/**
 * Save push token to Firestore so admins can receive notifications.
 */
export async function savePushToken(
  userId: string,
  role: string,
  token: string
): Promise<void> {
  await setDoc(doc(db, TOKENS_COLLECTION, userId), {
    user_id: userId,
    role,
    token,
    platform: Platform.OS,
    updated_at: new Date(),
  });
}

/**
 * Fetch all push tokens belonging to admin users.
 */
export async function getAdminPushTokens(): Promise<string[]> {
  const q = query(
    collection(db, TOKENS_COLLECTION),
    where("role", "==", "admin")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => d.data().token as string)
    .filter(Boolean);
}

/**
 * Send push notifications via Expo's push API.
 * This is a client-side call — no Cloud Functions required.
 */
export async function sendPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    to: token,
    title,
    body,
    data: data ?? {},
    sound: "default",
    priority: "high",
    channelId: "reports",
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });
}

/**
 * Notify all admins of a new overcharging report.
 * Silently fails — notifications are non-critical.
 */
export async function notifyAdminsOfReport(
  origin: string,
  destination: string,
  bodyNumber: string
): Promise<void> {
  try {
    const tokens = await getAdminPushTokens();
    if (tokens.length === 0) return;
    await sendPushNotifications(
      tokens,
      "🚨 New Overcharging Report",
      `Body #${bodyNumber} · ${origin} → ${destination}`,
      { screen: "admin_reports" }
    );
  } catch {
    // Silent fail — do not block report submission
  }
}
