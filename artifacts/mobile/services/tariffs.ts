import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Tariff } from "../types";

const COLLECTION = "tariffs";

function mapTariff(d: { id: string; data: () => Record<string, unknown> }): Tariff {
  const data = d.data();
  return {
    ...(data as Omit<Tariff, "id" | "createdAt" | "updatedAt">),
    id: d.id,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  } as Tariff;
}

export async function getTariffs(): Promise<Tariff[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("origin"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapTariff);
  } catch {
    // Fallback: fetch without orderBy if index fails
    const snapshot = await getDocs(collection(db, COLLECTION));
    const tariffs = snapshot.docs.map(mapTariff);
    return tariffs.sort((a, b) => a.origin.localeCompare(b.origin));
  }
}

export async function getTariffById(id: string): Promise<Tariff | null> {
  const ref = doc(db, COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return mapTariff({ id: snapshot.id, data: () => snapshot.data() as Record<string, unknown> });
}

export async function createTariff(data: Omit<Tariff, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTariff(id: string, data: Partial<Omit<Tariff, "id" | "createdAt">>): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTariff(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
