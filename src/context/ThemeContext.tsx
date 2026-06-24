import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { colors, darkColors } from '@/config/theme';

type ThemeColors = Record<keyof typeof colors, string>;

interface ThemeContextValue {
  isDark: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = '@splittable:darkMode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) {
        setIsDark(value === 'true');
      }
      setLoaded(true);
    }).catch(() => {
      setLoaded(true);
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, String(isDark));
  }, [isDark]);

  const theme = loaded ? (isDark ? darkColors : colors) : colors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, colors: theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
