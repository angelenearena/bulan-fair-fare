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

export async function getTariffs(): Promise<Tariff[]> {
  const q = query(collection(db, COLLECTION), orderBy("origin"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
    updatedAt: d.data().updatedAt?.toDate() ?? new Date(),
  })) as Tariff[];
}

export async function getTariffById(id: string): Promise<Tariff | null> {
  const ref = doc(db, COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate() ?? new Date(),
    updatedAt: snapshot.data().updatedAt?.toDate() ?? new Date(),
  } as Tariff;
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
