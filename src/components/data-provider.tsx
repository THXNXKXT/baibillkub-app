"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { listCustomers, listDocuments } from "@/lib/actions";

// ponytail: SWR แบบ jodtang — localStorage แสดงทันที refetch พื้นหลัง
// เพดาน: stale ได้แป๊บเดียวหลัง mutate; action แต่ละตัว revalidatePath อยู่แล้ว เรียก reload() ถ้าต้องการสดทันที
type Data = {
  customers: Awaited<ReturnType<typeof listCustomers>>;
  documents: Awaited<ReturnType<typeof listDocuments>>;
  loading: boolean;
};
type Ctx = Data & { reload: () => void };

const DataCtx = createContext<Ctx>({ customers: [], documents: [], loading: true, reload: () => {} });
const KEY = "baibillkub-data";

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ customers: [], documents: [], loading: true });

  const load = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
      if (cached) setData({ ...JSON.parse(cached), loading: false });
    } catch {}
    try {
      const [customers, documents] = await Promise.all([listCustomers(), listDocuments()]);
      setData({ customers, documents, loading: false });
      try { localStorage.setItem(KEY, JSON.stringify({ customers, documents })); } catch {}
    } catch {
      setData((p) => ({ ...p, loading: false }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <DataCtx.Provider value={{ ...data, reload: load }}>{children}</DataCtx.Provider>;
}

export const useAppData = () => useContext(DataCtx);
