import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadMistakes, loadSettings, saveMistakes, saveSettings, DEFAULT_SETTINGS } from './storage';
import { newReview, applyReview } from '../utils/scheduler';
import { rescheduleReminders } from '../utils/notifications';
import { makeId } from '../utils/id';
import { DEFAULT_CAUSES, DEFAULT_CATEGORIES } from '../utils/constants';
import { demoMistakes, isDemo } from '../utils/devPreview';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [mistakes, setMistakes] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const mistakesRef = useRef(mistakes);
  const settingsRef = useRef(settings);

  useEffect(() => {
    (async () => {
      let [m, s] = await Promise.all([loadMistakes(), loadSettings()]);
      if (isDemo()) {
        m = demoMistakes();
        s = { ...s, onboardingDone: true, name: 'Bharani', notificationsEnabled: false };
      }
      mistakesRef.current = m;
      settingsRef.current = s;
      setMistakes(m);
      setSettings(s);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready && settings.onboardingDone) rescheduleReminders(mistakes, settings);
  }, [ready, mistakes, settings]);

  const commitMistakes = useCallback((next) => {
    mistakesRef.current = next;
    setMistakes(next);
    return saveMistakes(next);
  }, []);

  const updateSettings = useCallback(async (patch) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    await saveSettings(next);
    return next;
  }, []);

  const addMistake = useCallback(
    async (input) => {
      const now = new Date().toISOString();
      const createdAt = input.createdAt || now;
      const mistake = {
        id: makeId(),
        title: input.title.trim(),
        description: (input.description || '').trim(),
        causes: input.causes,
        lesson: input.lesson.trim(),
        category: input.category,
        severity: input.severity,
        mood: input.mood || undefined,
        createdAt,
        updatedAt: now,
        // First review is tomorrow even when a past date is picked for the mistake.
        review: newReview(new Date()),
      };
      await commitMistakes([mistake, ...mistakesRef.current]);
      return mistake;
    },
    [commitMistakes],
  );

  const updateMistake = useCallback(
    async (id, patch) => {
      const next = mistakesRef.current.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m,
      );
      await commitMistakes(next);
    },
    [commitMistakes],
  );

  const deleteMistake = useCallback(
    (id) => commitMistakes(mistakesRef.current.filter((m) => m.id !== id)),
    [commitMistakes],
  );

  const reviewMistake = useCallback(
    async (id, followed) => {
      let updated = null;
      const next = mistakesRef.current.map((m) => {
        if (m.id !== id) return m;
        updated = applyReview(m, followed);
        return updated;
      });
      await commitMistakes(next);
      return updated;
    },
    [commitMistakes],
  );

  const importData = useCallback(
    async ({ mistakes: incoming, settings: incomingSettings }, mode) => {
      let next;
      if (mode === 'replace') {
        next = incoming;
      } else {
        const byId = new Map(mistakesRef.current.map((m) => [m.id, m]));
        incoming.forEach((m) => {
          const existing = byId.get(m.id);
          if (!existing || new Date(m.updatedAt) > new Date(existing.updatedAt)) byId.set(m.id, m);
        });
        next = [...byId.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      await commitMistakes(next);
      const merge = (a = [], b = []) => [...new Set([...a, ...b])];
      await updateSettings({
        customCauses: merge(settingsRef.current.customCauses, incomingSettings.customCauses),
        customCategories: merge(settingsRef.current.customCategories, incomingSettings.customCategories),
      });
      return next.length;
    },
    [commitMistakes, updateSettings],
  );

  const resetAll = useCallback(async () => {
    await commitMistakes([]);
  }, [commitMistakes]);

  const causes = useMemo(
    () => [...DEFAULT_CAUSES, ...settings.customCauses],
    [settings.customCauses],
  );
  const categories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...settings.customCategories],
    [settings.customCategories],
  );

  const value = useMemo(
    () => ({
      ready,
      mistakes,
      settings,
      causes,
      categories,
      addMistake,
      updateMistake,
      deleteMistake,
      reviewMistake,
      updateSettings,
      importData,
      resetAll,
    }),
    [ready, mistakes, settings, causes, categories, addMistake, updateMistake, deleteMistake, reviewMistake, updateSettings, importData, resetAll],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
