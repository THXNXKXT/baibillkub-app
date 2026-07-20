"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { listCustomers, listDocuments, listTrash, getSettings } from "@/lib/actions";

// ponytail: SWR แบบ jodtang — localStorage แสดงทันที refetch พื้นหลัง
// เพดาน: stale ได้แป๊บเดียวหลัง mutate; action แต่ละตัว revalidatePath อยู่แล้ว เรียก reload() ถ้าต้องการสดทันที
type Data = {
  customers: Awaited<ReturnType<typeof listCustomers>>;
  documents: Awaited<ReturnType<typeof listDocuments>>;
  trash: Awaited<ReturnType<typeof listDocuments>>;
  settings: Awaited<ReturnType<typeof getSettings>> | null;
  loading: boolean;
};
type Ctx = Data & { reload: () => void };

const DataCtx = createContext<Ctx>({ customers: [], documents: [], trash: [], settings: null, loading: true, reload: () => {} });
const KEY = "baibillkub-data";

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ customers: [], documents: [], trash: [], settings: null, loading: true });

  const load = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
      if (cached) setData({ ...JSON.parse(cached), loading: false });
    } catch {}
    try {
      const [customers, documents, trash, settings] = await Promise.all([listCustomers(), listDocuments(), listTrash(), getSettings()]);
      if (!settings) throw new Error("unauthorized");
      setData({ customers, documents, trash, settings, loading: false });
      try { localStorage.setItem(KEY, JSON.stringify({ customers, documents, trash, settings })); } catch {}
    } catch (e) {
      // ponytail: signOut แล้ว session หาย — อย่า retry ให้ redirect ไปเอง
      if (e instanceof Error && e.message === "unauthorized") {
        localStorage.removeItem(KEY);
        window.location.href = "/login";
        return;
      }
      setData((p) => ({ ...p, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/login") return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  return <DataCtx.Provider value={{ ...data, reload: load }}>{children}</DataCtx.Provider>;
}

export const useAppData = () => useContext(DataCtx);
