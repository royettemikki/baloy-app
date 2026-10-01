'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${theme}`);
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Keep the first render deterministic for SSR/hydration. The inline script in
  // app/layout.tsx paints the saved theme before React loads; this effect then
  // synchronizes React state with that already-applied theme.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next: Theme = stored === 'dark' ? 'dark' : 'light';
    setThemeState(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
