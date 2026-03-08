import { useState, useEffect } from 'react';
import { getSharedRouteFromUrl } from '../utils/sharing';
import type { Activity, RouteStats } from '../types';

type SharedRoute = {
  coords: [number, number][];
  stats: RouteStats;
  activity: Activity;
};

export function useSharedRoute() {
  const [sharedRoute, setSharedRoute] = useState<SharedRoute | null>(null);

  useEffect(() => {
    const data = getSharedRouteFromUrl();
    if (data) {
      setSharedRoute(data);
      // Clean the hash from URL without triggering navigation
      history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const clearShared = () => setSharedRoute(null);

  return { sharedRoute, clearShared };
}
