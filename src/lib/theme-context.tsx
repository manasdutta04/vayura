'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const savedThemeRaw = localStorage.getItem('theme');
  if (savedThemeRaw === 'light' || savedThemeRaw === 'dark') return savedThemeRaw;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return systemTheme;
}

function applyTheme(newTheme: Theme) {
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
}

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => callback();
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Use useSyncExternalStore for SSR-safe hydration
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  // Prevent flash of wrong theme during SSR
  if (!isMounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', setTheme: handleSetTheme, toggleTheme }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

