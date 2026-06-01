'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type AiApiSettings,
  DEFAULT_AI_API_SETTINGS,
  loadAiApiSettings,
  saveAiApiSettings,
} from '../utils/aiSettingsCore';

interface AiApiSettingsContextValue {
  settings: AiApiSettings;
  updateSettings: (updates: Partial<AiApiSettings>) => void;
  resetSettings: () => void;
}

const AiApiSettingsContext = createContext<AiApiSettingsContextValue | null>(null);

export function AiApiSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AiApiSettings>(DEFAULT_AI_API_SETTINGS);

  useEffect(() => {
    setSettings(loadAiApiSettings());
  }, []);

  const persist = useCallback((next: AiApiSettings) => {
    setSettings(next);
    saveAiApiSettings(next);
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<AiApiSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updates };
        saveAiApiSettings(next);
        return next;
      });
    },
    []
  );

  const resetSettings = useCallback(() => {
    persist(DEFAULT_AI_API_SETTINGS);
  }, [persist]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings]
  );

  return (
    <AiApiSettingsContext.Provider value={value}>{children}</AiApiSettingsContext.Provider>
  );
}

export function useAiApiSettings() {
  const ctx = useContext(AiApiSettingsContext);
  if (!ctx) {
    throw new Error('useAiApiSettings must be used within AiApiSettingsProvider');
  }
  return ctx;
}
