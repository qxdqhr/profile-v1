import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type LessonReaderBarPosition = 'top' | 'bottom' | 'left' | 'right';

export type LessonReaderSettings = {
  barPosition: LessonReaderBarPosition;
  barExpanded: boolean;
};

const STORAGE_KEY = 'teach-hub:lesson-reader-settings';
const POSITIONS: LessonReaderBarPosition[] = ['top', 'bottom', 'left', 'right'];

const DEFAULT_SETTINGS: LessonReaderSettings = {
  barPosition: 'top',
  barExpanded: true,
};

function normalizePosition(value: unknown): LessonReaderBarPosition {
  if (typeof value === 'string' && POSITIONS.includes(value as LessonReaderBarPosition)) {
    return value as LessonReaderBarPosition;
  }
  return DEFAULT_SETTINGS.barPosition;
}

export async function getLessonReaderSettings(): Promise<LessonReaderSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<LessonReaderSettings>;
    return {
      barPosition: normalizePosition(parsed.barPosition),
      barExpanded: parsed.barExpanded !== false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveLessonReaderSettings(
  patch: Partial<LessonReaderSettings>,
): Promise<LessonReaderSettings> {
  const current = await getLessonReaderSettings();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function isVerticalReaderPosition(position: LessonReaderBarPosition): boolean {
  return position === 'left' || position === 'right';
}

export function useLessonReaderSettings() {
  const [settings, setSettings] = useState<LessonReaderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    void getLessonReaderSettings().then(setSettings);
  }, []);

  const setBarPosition = useCallback(async (barPosition: LessonReaderBarPosition) => {
    const next = await saveLessonReaderSettings({ barPosition });
    setSettings(next);
  }, []);

  const setBarExpanded = useCallback(async (barExpanded: boolean) => {
    const next = await saveLessonReaderSettings({ barExpanded });
    setSettings(next);
  }, []);

  return {
    settings,
    setBarPosition,
    setBarExpanded,
  };
}
