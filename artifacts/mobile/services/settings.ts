import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { GlobalSettings } from "../types";

const COLLECTION = "global_settings";
const DOC_ID = "current_rates";

const DEFAULT_SETTINGS: Omit<GlobalSettings, "updated_by" | "updatedAt"> = {
  base_fare: 15.0,
  per_km_rate: 2.5,
  minimum_fare: 10.0,
  fuel_price_index: 62.5,
};

export async function getSettings(): Promise<GlobalSettings> {
  const ref = doc(db, COLLECTION, DOC_ID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return {
      ...DEFAULT_SETTINGS,
      updated_by: "system",
      updatedAt: new Date(),
    };
  }
  return {
    ...snapshot.data(),
    updatedAt: snapshot.data().updatedAt?.toDate() ?? new Date(),
  } as GlobalSettings;
}

export async function updateSettings(
  data: Partial<Omit<GlobalSettings, "updated_by" | "updatedAt">>,
  adminUid: string
): Promise<void> {
  const ref = doc(db, COLLECTION, DOC_ID);
  await setDoc(
    ref,
    { ...data, updated_by: adminUid, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
