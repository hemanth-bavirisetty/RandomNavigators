import { useState, useCallback } from 'react';
import { generateWaypoints } from '../utils/geo';
import type { Activity, RouteStats } from '../types';

export function useRouteGenerator() {
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      startLocation: [number, number],
      endLocation: [number, number] | null,
      distance: number,
      activity: Activity
    ) => {
      if (isNaN(distance) || distance <= 0) {
        setError('Please enter a valid distance greater than 0.');
        return;
      }

      setLoading(true);
      setError(null);
      setRouteCoords(null);
      setRouteStats(null);

      const actualEnd = endLocation || startLocation;

      try {
        let bestRoute: any = null;
        let bestDiff = Infinity;

        for (let i = 0; i < 5; i++) {
          const waypoints = generateWaypoints(
            startLocation[0],
            startLocation[1],
            actualEnd[0],
            actualEnd[1],
            distance
          );
          const coordsStr = waypoints
            .map((wp) => `${wp[0]},${wp[1]}`)
            .join(';');

          const profile = activity;
          const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsStr}?overview=full&geometries=geojson`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Failed to fetch route from routing service.');
          }

          const data = await response.json();
          if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            continue;
          }

          const route = data.routes[0];
          const routeDistKm = route.distance / 1000;
          const diff = Math.abs(routeDistKm - distance);

          if (diff < bestDiff) {
            bestDiff = diff;
            bestRoute = route;
          }

          if (diff / distance < 0.2) {
            break;
          }
        }

        if (!bestRoute) {
          throw new Error(
            'Could not generate a valid route. Try a different distance or location.'
          );
        }

        const latLngs: [number, number][] = bestRoute.geometry.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]]
        );

        setRouteCoords(latLngs);
        setRouteStats({
          distance: bestRoute.distance / 1000,
          duration: bestRoute.duration / 60,
        });
      } catch (err: any) {
        setError(
          err.message || 'An error occurred while generating the route.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setRouteCoords(null);
    setRouteStats(null);
    setError(null);
  }, []);

  const loadRoute = useCallback(
    (coords: [number, number][], stats: RouteStats) => {
      setRouteCoords(coords);
      setRouteStats(stats);
      setError(null);
    },
    []
  );

  return { routeCoords, routeStats, loading, error, generate, clear, loadRoute };
}
