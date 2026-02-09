import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AdminTheme = 'studio' | 'portfolio';

interface AdminThemeContextValue {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
  isPortfolio: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'admin_theme';

const getInitialTheme = (): AdminTheme => {
  if (typeof window === 'undefined') return 'portfolio';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'studio' || stored === 'portfolio') return stored;
  if (stored === 'dark') return 'studio';
  if (stored === 'light') return 'portfolio';
  return 'portfolio';
};

export const AdminThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => getInitialTheme());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-admin-theme', theme);
    return () => {
      document.documentElement.removeAttribute('data-admin-theme');
    };
  }, [theme]);

  const setTheme = (next: AdminTheme) => setThemeState(next);
  const toggleTheme = () => setThemeState((prev) => (prev === 'portfolio' ? 'studio' : 'portfolio'));

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isPortfolio: theme === 'portfolio',
    }),
    [theme]
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};
