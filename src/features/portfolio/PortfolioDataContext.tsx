import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { defaultPortfolioData, type PortfolioData } from "./data/portfolio-data";
import {
  fetchPortfolioData,
  isSupabaseConfigured,
  upsertPortfolioData,
  type PartialPortfolioData,
} from "./portfolioApi";

type PortfolioDataContextValue = {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  supabaseEnabled: boolean;
  refresh: () => Promise<void>;
  save: (nextData: PortfolioData) => Promise<void>;
  setData: Dispatch<SetStateAction<PortfolioData>>;
};

const PortfolioDataContext = createContext<PortfolioDataContextValue | undefined>(undefined);

const mergeWithDefaults = (remote: PartialPortfolioData | null) => ({
  ...defaultPortfolioData,
  ...(remote ?? {}),
  personalData: {
    ...defaultPortfolioData.personalData,
    ...(remote?.personalData ?? {}),
    stats: {
      ...defaultPortfolioData.personalData.stats,
      ...(remote?.personalData?.stats ?? {}),
    },
  },
  settings: {
    ...defaultPortfolioData.settings,
    ...(remote?.settings ?? {}),
    seo: {
      ...defaultPortfolioData.settings.seo,
      ...(remote?.settings?.seo ?? {}),
    },
    theme: {
      ...defaultPortfolioData.settings.theme,
      ...(remote?.settings?.theme ?? {}),
    },
    ui: {
      ...defaultPortfolioData.settings.ui,
      ...(remote?.settings?.ui ?? {}),
    },
  },
});

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const shallowEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export const PortfolioDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const setStableData = useCallback((updater: PortfolioData | ((prev: PortfolioData) => PortfolioData)) => {
    setData(prev => {
      const next = typeof updater === 'function' ? (updater as (p: PortfolioData) => PortfolioData)(prev) : updater;
      if (shallowEqual(prev, next)) return prev;
      dataRef.current = next;
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const remoteData = await fetchPortfolioData();
      if (remoteData) {
        setStableData(mergeWithDefaults(remoteData));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [setStableData]);

  const save = useCallback(async (nextData: PortfolioData) => {
    setLoading(true);
    setError(null);
    try {
      setStableData(nextData);
      await upsertPortfolioData(nextData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [setStableData]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const handleUpdate = () => {
      refresh();
    };
    window.addEventListener('portfolio-data-updated', handleUpdate);
    return () => window.removeEventListener('portfolio-data-updated', handleUpdate);
  }, [refresh]);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      supabaseEnabled: isSupabaseConfigured,
      refresh,
      save,
      setData: setStableData,
    }),
    [data, loading, error, refresh, save, setStableData],
  );

  return <PortfolioDataContext.Provider value={value}>{children}</PortfolioDataContext.Provider>;
};

export const usePortfolioData = () => {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error("usePortfolioData must be used within PortfolioDataProvider");
  }
  return context;
};
