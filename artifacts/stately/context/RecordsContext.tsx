import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DailyRecord } from "@/types/DailyRecord";
import { clearRecordsCache, loadRecords, saveRecord } from "@/utils/storage";
import { getDailyRecords, saveDailyRecord } from "@/services/firestore";
import { useAuth } from "@/context/AuthContext";

type DataSource = "firestore" | "local";

interface RecordsContextType {
  records: DailyRecord[];
  addRecord: (record: DailyRecord) => Promise<void>;
  loading: boolean;
  source: DataSource;
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
}

const RecordsContext = createContext<RecordsContextType>({
  records: [],
  addRecord: async () => {},
  loading: true,
  source: "local",
  refresh: async () => {},
  clear: async () => {},
});

export function RecordsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<DataSource>("firestore");

  const load = async () => {
    if (!uid) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const firestoreRecords = await getDailyRecords(uid);
      setRecords(firestoreRecords);
      setSource("firestore");
    } catch (err) {
      console.warn("[Stately] Firestore unavailable, falling back to AsyncStorage:", err);
      const localRecords = await loadRecords();
      setRecords(localRecords);
      setSource("local");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [uid]);

  const addRecord = async (record: DailyRecord) => {
    if (uid) {
      try {
        await saveDailyRecord(uid, record);
      } catch (err) {
        console.warn("[Stately] Firestore write failed, saving locally only:", err);
      }
    }
    await saveRecord(record);
    await load();
  };

  const clear = async () => {
    setRecords([]);
    await clearRecordsCache();
  };

  return (
    <RecordsContext.Provider
      value={{ records, addRecord, loading, source, refresh: load, clear }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export const useRecords = () => useContext(RecordsContext);
