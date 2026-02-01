'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vayura-theme';

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getEffectiveTheme(theme: Theme): EffectiveTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme as EffectiveTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme = storedTheme || 'system';
    
    setThemeState(initialTheme);
    setEffectiveTheme(getEffectiveTheme(initialTheme));
    setMounted(true);

    // Apply theme to document
    applyTheme(getEffectiveTheme(initialTheme));
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newEffectiveTheme = getSystemTheme();
      setEffectiveTheme(newEffectiveTheme);
      applyTheme(newEffectiveTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  function applyTheme(newTheme: EffectiveTheme) {
    const htmlElement = document.documentElement;
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    const newEffectiveTheme = getEffectiveTheme(newTheme);
    setEffectiveTheme(newEffectiveTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newEffectiveTheme);
  }

  function toggleTheme() {
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
