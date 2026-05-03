import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { DailyRecord } from "@/types/DailyRecord";
import { loadRecords, saveRecord } from "@/utils/storage";
import { getDailyRecords, saveDailyRecord, DEMO_UID } from "@/services/firestore";

type DataSource = "firestore" | "local";

interface RecordsContextType {
  records: DailyRecord[];
  addRecord: (record: DailyRecord) => Promise<void>;
  loading: boolean;
  source: DataSource;
  refresh: () => Promise<void>;
}

const RecordsContext = createContext<RecordsContextType>({
  records: [],
  addRecord: async () => {},
  loading: true,
  source: "local",
  refresh: async () => {},
});

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<DataSource>("firestore");

  const load = async () => {
    setLoading(true);
    try {
      const firestoreRecords = await getDailyRecords(DEMO_UID);
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
  }, []);

  const addRecord = async (record: DailyRecord) => {
    try {
      await saveDailyRecord(DEMO_UID, record);
    } catch (err) {
      console.warn("[Stately] Firestore write failed, saving locally only:", err);
    }
    // Always mirror to AsyncStorage as offline backup
    await saveRecord(record);
    await load();
  };

  return (
    <RecordsContext.Provider value={{ records, addRecord, loading, source, refresh: load }}>
      {children}
    </RecordsContext.Provider>
  );
}

export const useRecords = () => useContext(RecordsContext);
