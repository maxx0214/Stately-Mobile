import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyRecord } from "@/types/DailyRecord";

const RECORDS_KEY = "stately_records";
const ONBOARDED_KEY = "stately_onboarded";

export async function loadRecords(): Promise<DailyRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyRecord[];
  } catch {
    return [];
  }
}

export async function saveRecord(record: DailyRecord): Promise<void> {
  const records = await loadRecords();
  const existingIndex = records.findIndex((r) => r.date === record.date);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.unshift(record);
  }
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export async function clearRecordsCache(): Promise<void> {
  await AsyncStorage.removeItem(RECORDS_KEY);
}

export async function clearLocalAppState(): Promise<void> {
  const keys = [RECORDS_KEY, ONBOARDED_KEY];
  await AsyncStorage.multiRemove(keys);
}

export async function isOnboarded(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDED_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, "true");
}
