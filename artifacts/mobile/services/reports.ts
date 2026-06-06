import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { OverchargingReport, AITag } from "../types";

const COLLECTION = "overcharging_reports";

function autoTag(description: string): AITag[] {
  const text = description.toLowerCase();
  const tags: AITag[] = [];

  const overchargeKW = ["overcharge", "singil", "mahal", "sobra", "bayad", "dagdag"];
  const misconductKW = ["bastos", "away", "rude", "insulto", "galit", "bwisit", "masamang"];
  const recklessKW = ["mabilis", "harurot", "dangerous", "delikado", "bilis", "overspeeding"];

  if (overchargeKW.some((kw) => text.includes(kw))) tags.push("Fare Overcharge");
  if (misconductKW.some((kw) => text.includes(kw))) tags.push("Driver Misconduct");
  if (recklessKW.some((kw) => text.includes(kw))) tags.push("Reckless Driving");

  if (tags.length === 0) tags.push("Fare Overcharge");

  return tags;
}

export async function getMyReports(userId: string): Promise<OverchargingReport[]> {
  const q = query(
    collection(db, COLLECTION),
    where("user_id", "==", userId),
    where("is_archived", "==", false),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
    updatedAt: d.data().updatedAt?.toDate() ?? new Date(),
    incident_date: d.data().incident_date?.toDate() ?? new Date(),
  })) as OverchargingReport[];
}

export async function getAllReports(): Promise<OverchargingReport[]> {
  const q = query(
    collection(db, COLLECTION),
    where("is_archived", "==", false),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
    updatedAt: d.data().updatedAt?.toDate() ?? new Date(),
    incident_date: d.data().incident_date?.toDate() ?? new Date(),
  })) as OverchargingReport[];
}

export function subscribeToAllReports(callback: (reports: OverchargingReport[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("is_archived", "==", false),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
      updatedAt: d.data().updatedAt?.toDate() ?? new Date(),
      incident_date: d.data().incident_date?.toDate() ?? new Date(),
    })) as OverchargingReport[];
    callback(reports);
  });
}

export function subscribeToMyReports(userId: string, callback: (reports: OverchargingReport[]) => void): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("user_id", "==", userId),
    where("is_archived", "==", false),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
      updatedAt: d.data().updatedAt?.toDate() ?? new Date(),
      incident_date: d.data().incident_date?.toDate() ?? new Date(),
    })) as OverchargingReport[];
    callback(reports);
  });
}

export async function createReport(
  data: Omit<OverchargingReport, "id" | "ai_tags" | "status" | "is_archived" | "createdAt" | "updatedAt">
): Promise<string> {
  const ai_tags = autoTag(data.description);
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    ai_tags,
    status: "Pending",
    is_archived: false,
    incident_date: data.incident_date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateReportStatus(id: string, status: OverchargingReport["status"]): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveReport(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    is_archived: true,
    updatedAt: serverTimestamp(),
  });
}
