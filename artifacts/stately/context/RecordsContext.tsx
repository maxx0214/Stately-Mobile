import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { DailyRecord } from "@/types/DailyRecord";
import { loadRecords, saveRecord } from "@/utils/storage";

interface RecordsContextType {
  records: DailyRecord[];
  addRecord: (record: DailyRecord) => Promise<void>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const RecordsContext = createContext<RecordsContextType>({
  records: [],
  addRecord: async () => {},
  loading: true,
  refresh: async () => {},
});

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await loadRecords();
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addRecord = async (record: DailyRecord) => {
    await saveRecord(record);
    await load();
  };

  return (
    <RecordsContext.Provider
      value={{ records, addRecord, loading, refresh: load }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export const useRecords = () => useContext(RecordsContext);
