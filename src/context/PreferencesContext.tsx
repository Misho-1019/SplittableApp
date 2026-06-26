import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { currencies } from '@/config/theme';

type Currency = (typeof currencies)[number];

interface PreferencesContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const CURRENCY_KEY = '@splittable:currency';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(currencies[0]);

  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_KEY).then((value) => {
      if (value) {
        try {
          const parsed = JSON.parse(value);
          const found = currencies.find((c) => c.code === parsed.code);
          if (found) setCurrencyState(found);
        } catch {
          // ignore invalid stored value
        }
      }
    });
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    AsyncStorage.setItem(CURRENCY_KEY, JSON.stringify(c));
  }, []);

  return (
    <PreferencesContext.Provider value={{ currency, setCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
