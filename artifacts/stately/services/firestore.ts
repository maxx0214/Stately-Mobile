import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DailyRecord } from "@/types/DailyRecord";

export const DEMO_UID = "demo-user";

function dailyRef(uid: string, date: string) {
  return doc(db, "users", uid, "daily", date);
}

function dailyCollection(uid: string) {
  return collection(db, "users", uid, "daily");
}

export async function saveDailyRecord(
  uid: string,
  record: DailyRecord
): Promise<void> {
  await setDoc(dailyRef(uid, record.date), record, { merge: true });
}

export async function getDailyRecords(uid: string): Promise<DailyRecord[]> {
  const snapshot = await getDocs(dailyCollection(uid));
  const records = snapshot.docs.map((d) => d.data() as DailyRecord);
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTodayRecord(
  uid: string,
  date: string
): Promise<DailyRecord | null> {
  const snapshot = await getDoc(dailyRef(uid, date));
  return snapshot.exists() ? (snapshot.data() as DailyRecord) : null;
}

export async function deleteDailyRecord(
  uid: string,
  date: string
): Promise<void> {
  await deleteDoc(dailyRef(uid, date));
}
