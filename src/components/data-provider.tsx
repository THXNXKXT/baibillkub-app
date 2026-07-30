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
type DebugInfo = {
  action: string;
  message: string;
  digest?: string;
  path: string;
  at: string;
  hasSessionCookie: boolean;
};
type Ctx = Data & { reload: () => void };

const DataCtx = createContext<Ctx>({ customers: [], documents: [], trash: [], settings: null, loading: true, reload: () => {} });
const KEY = "baibillkub-data";

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ customers: [], documents: [], trash: [], settings: null, loading: true });
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const load = useCallback(async () => {
    setDebugInfo(null);
    try {
      const cached = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
      if (cached) setData({ ...JSON.parse(cached), loading: false });
    } catch {}
    try {
      const call = async <T,>(action: string, fn: () => Promise<T>) => {
        try {
          return await fn();
        } catch (cause) {
          const error = cause instanceof Error ? cause : new Error(String(cause));
          throw Object.assign(error, { action });
        }
      };
      const [customers, documents, trash, settings] = await Promise.all([
        call("listCustomers", listCustomers),
        call("listDocuments", listDocuments),
        call("listTrash", listTrash),
        call("getSettings", getSettings),
      ]);
      if (!settings) throw new Error("unauthorized");
      setData({ customers, documents, trash, settings, loading: false });
      try { localStorage.setItem(KEY, JSON.stringify({ customers, documents, trash, settings })); } catch {}
    } catch (e) {
      const error = e as Error & { action?: string; digest?: string };
      if (process.env.NODE_ENV === "development") {
        const cookie = document.cookie;
        const info = {
          action: error.action ?? "unknown",
          message: error.message || String(e),
          digest: error.digest,
          path: window.location.pathname,
          at: new Date().toISOString(),
          hasSessionCookie: /better-auth\.session_token=/.test(cookie),
        };
        console.error("[DEBUG-data-provider]", info, e);
        setDebugInfo(info);
        setData((p) => ({ ...p, loading: false }));
        return;
      }
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

  return (
    <DataCtx.Provider value={{ ...data, reload: load }}>
      {children}
      {debugInfo && <DebugPanel info={debugInfo} onClose={() => setDebugInfo(null)} />}
    </DataCtx.Provider>
  );
}

export const useAppData = () => useContext(DataCtx);

function DebugPanel({ info, onClose }: { info: DebugInfo; onClose: () => void }) {
  return (
    <section className="fixed bottom-4 right-4 z-[100] w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-950 shadow-xl">
      <div className="mb-3 flex items-center justify-between font-sans">
        <p className="font-semibold">Development debug: Server Action failed</p>
        <button type="button" onClick={onClose} className="rounded px-2 py-1 hover:bg-red-100">ปิด</button>
      </div>
      <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 break-all">
        <dt>action</dt><dd>{info.action}</dd>
        <dt>message</dt><dd>{info.message}</dd>
        <dt>digest</dt><dd>{info.digest ?? "none"}</dd>
        <dt>path</dt><dd>{info.path}</dd>
        <dt>session cookie</dt><dd>{info.hasSessionCookie ? "present" : "missing"}</dd>
        <dt>time</dt><dd>{info.at}</dd>
      </dl>
    </section>
  );
}
