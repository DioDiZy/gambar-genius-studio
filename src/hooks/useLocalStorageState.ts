import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageState<T>(key: string, fallback: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      console.warn(`localStorage key "${key}" has invalid data, using fallback.`);
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [key, state]);

  return [state, setState];
}