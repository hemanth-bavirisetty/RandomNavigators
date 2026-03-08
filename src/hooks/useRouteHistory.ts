import { useState, useEffect, useCallback } from 'react';
import type { RouteHistoryItem } from '../types';

const STORAGE_KEY = 'routeHistory';

export function useRouteHistory() {
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to parse route history', e);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const save = useCallback(
    (item: Omit<RouteHistoryItem, 'id' | 'date'>) => {
      const newItem: RouteHistoryItem = {
        ...item,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      setHistory((prev) => [newItem, ...prev]);
    },
    []
  );

  const remove = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { history, save, remove };
}
