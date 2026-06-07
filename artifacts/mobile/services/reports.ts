import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
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

  const overchargeKW = ["overcharge", "singil", "mahal", "sobra", "bayad", "dagdag", "charge", "bayaran"];
  const misconductKW = ["bastos", "away", "rude", "insulto", "galit", "bwisit", "masamang", "rude", "bad behavior", "behavior"];
  const recklessKW = ["mabilis", "harurot", "dangerous", "delikado", "bilis", "overspeeding", "fast", "racing", "ligaw"];

  if (overchargeKW.some((kw) => text.includes(kw))) tags.push("Fare Overcharge");
  if (misconductKW.some((kw) => text.includes(kw))) tags.push("Driver Misconduct");
  if (recklessKW.some((kw) => text.includes(kw))) tags.push("Reckless Driving");

  if (tags.length === 0) tags.push("Fare Overcharge");

  return tags;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(d: any): OverchargingReport {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    incident_date: data.incident_date?.toDate
      ? data.incident_date.toDate()
      : new Date(data.incident_date ?? Date.now()),
  } as OverchargingReport;
}

function sortByDate(reports: OverchargingReport[]): OverchargingReport[] {
  return [...reports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getMyReports(userId: string): Promise<OverchargingReport[]> {
  // Single where clause — no composite index needed
  const q = query(collection(db, COLLECTION), where("user_id", "==", userId));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(mapDoc);
  return sortByDate(all.filter((r) => !r.is_archived));
}

export async function getAllReports(): Promise<OverchargingReport[]> {
  // Single where clause — no composite index needed
  const q = query(collection(db, COLLECTION), where("is_archived", "==", false));
  const snapshot = await getDocs(q);
  return sortByDate(snapshot.docs.map(mapDoc));
}

export function subscribeToAllReports(
  callback: (reports: OverchargingReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // Single where clause avoids composite index requirement
  const q = query(collection(db, COLLECTION), where("is_archived", "==", false));
  return onSnapshot(
    q,
    (snapshot) => {
      const reports = sortByDate(snapshot.docs.map(mapDoc));
      callback(reports);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export function subscribeToMyReports(
  userId: string,
  callback: (reports: OverchargingReport[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // Single where clause avoids composite index requirement; filter archived in JS
  const q = query(collection(db, COLLECTION), where("user_id", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const all = snapshot.docs.map(mapDoc);
      const active = sortByDate(all.filter((r) => !r.is_archived));
      callback(active);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createReport(
  data: Omit<OverchargingReport, "id" | "ai_tags" | "status" | "is_archived" | "createdAt" | "updatedAt">
): Promise<string> {
  const ai_tags = autoTag(data.description);
  const payload: Record<string, unknown> = {
    ...data,
    ai_tags,
    status: "Pending",
    is_archived: false,
    incident_date: data.incident_date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (data.evidence_url) {
    payload.evidence_url = data.evidence_url;
  }
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

export async function updateReportStatus(id: string, status: OverchargingReport["status"]): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getReportById(id: string): Promise<OverchargingReport | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapDoc(snapshot);
}

export async function archiveReport(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    is_archived: true,
    updatedAt: serverTimestamp(),
  });
}
