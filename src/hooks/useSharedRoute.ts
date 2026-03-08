import { useState, useEffect } from 'react';
import { getShareIdFromUrl, loadSharedRoute } from '../utils/sharing';
import type { Activity, RouteStats } from '../types';

type SharedRoute = {
  coords: [number, number][];
  stats: RouteStats;
  activity: Activity;
};

export function useSharedRoute() {
  const [sharedRoute, setSharedRoute] = useState<SharedRoute | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shareId = getShareIdFromUrl();
    if (!shareId) return;

    setLoading(true);
    loadSharedRoute(shareId)
      .then((data) => {
        if (data) setSharedRoute(data);
        // Clean hash from URL
        history.replaceState(null, '', window.location.pathname);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const clearShared = () => setSharedRoute(null);

  return { sharedRoute, loading: loading, clearShared };
}
