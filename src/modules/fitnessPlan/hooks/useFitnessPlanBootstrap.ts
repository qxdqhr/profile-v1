'use client';

import { useCallback, useEffect } from 'react';
import { useFitnessPlanStore } from '../store/fitnessPlanStore';
import type { FitnessProfileFormData } from '../types';
import { parseProfileNumbers } from '../types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? payload.message ?? '请求失败');
  }

  return payload as T;
}

export function useFitnessPlanBootstrap(enabled: boolean) {
  const setProfile = useFitnessPlanStore((s) => s.setProfile);
  const setProfileLoading = useFitnessPlanStore((s) => s.setProfileLoading);
  const setProfileError = useFitnessPlanStore((s) => s.setProfileError);
  const setCheckinToday = useFitnessPlanStore((s) => s.setCheckinToday);
  const resetForLogout = useFitnessPlanStore((s) => s.resetForLogout);

  const hydrate = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const [profileRes, checkinRes] = await Promise.all([
        fetchJson<{ success: boolean; data: ReturnType<typeof parseProfileNumbers> }>(
          '/api/fitnessPlan/profile',
        ),
        fetchJson<{ success: boolean; data: { daily: boolean; workout: boolean; diet: boolean; weight: boolean } }>(
          '/api/fitnessPlan/checkins/today',
        ),
      ]);

      setProfile(profileRes.data);
      setCheckinToday(checkinRes.data);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : '加载失败');
    } finally {
      setProfileLoading(false);
    }
  }, [setCheckinToday, setProfile, setProfileError, setProfileLoading]);

  useEffect(() => {
    if (!enabled) {
      resetForLogout();
      return;
    }

    void hydrate();
  }, [enabled, hydrate, resetForLogout]);

  const updateProfile = useCallback(
    async (data: FitnessProfileFormData) => {
      const response = await fetchJson<{
        success: boolean;
        data: ReturnType<typeof parseProfileNumbers>;
      }>('/api/fitnessPlan/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setProfile(response.data);
      return response.data;
    },
    [setProfile],
  );

  return { hydrate, updateProfile };
}
