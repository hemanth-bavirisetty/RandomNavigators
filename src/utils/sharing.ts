import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Activity, RouteStats } from '../types';

type SharedRouteData = {
  coords: [number, number][];
  stats: RouteStats;
  activity: Activity;
};

/**
 * Delta-encode coordinates for better compression.
 * Stores the first point as-is, then deltas (multiplied by 1e5 and rounded).
 */
function deltaEncode(coords: [number, number][]): number[] {
  if (coords.length === 0) return [];

  const encoded: number[] = [
    Math.round(coords[0][0] * 1e5),
    Math.round(coords[0][1] * 1e5),
  ];

  for (let i = 1; i < coords.length; i++) {
    encoded.push(Math.round((coords[i][0] - coords[i - 1][0]) * 1e5));
    encoded.push(Math.round((coords[i][1] - coords[i - 1][1]) * 1e5));
  }

  return encoded;
}

/**
 * Decode delta-encoded coordinates back to lat/lng pairs.
 */
function deltaDecode(encoded: number[]): [number, number][] {
  if (encoded.length < 2) return [];

  const coords: [number, number][] = [
    [encoded[0] / 1e5, encoded[1] / 1e5],
  ];

  for (let i = 2; i < encoded.length; i += 2) {
    const prev = coords[coords.length - 1];
    coords.push([
      prev[0] + encoded[i] / 1e5,
      prev[1] + encoded[i + 1] / 1e5,
    ]);
  }

  return coords;
}

/**
 * Encode route data into a URL-safe compressed string.
 */
export function encodeRoute(
  coords: [number, number][],
  stats: RouteStats,
  activity: Activity
): string {
  const payload = {
    c: deltaEncode(coords),
    d: Math.round(stats.distance * 100), // 2 decimal precision
    t: Math.round(stats.duration),
    a: activity === 'foot' ? 0 : 1,
  };

  return compressToEncodedURIComponent(JSON.stringify(payload));
}

/**
 * Decode a compressed route string back to route data.
 */
export function decodeRoute(encoded: string): SharedRouteData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const payload = JSON.parse(json);
    return {
      coords: deltaDecode(payload.c),
      stats: {
        distance: payload.d / 100,
        duration: payload.t,
      },
      activity: payload.a === 0 ? 'foot' : 'bike',
    };
  } catch {
    return null;
  }
}

/**
 * Generate a full shareable URL for the given route.
 */
export function generateShareUrl(
  coords: [number, number][],
  stats: RouteStats,
  activity: Activity
): string {
  const hash = encodeRoute(coords, stats, activity);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#route=${hash}`;
}

/**
 * Try to extract shared route data from current URL hash.
 */
export function getSharedRouteFromUrl(): SharedRouteData | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#route=')) return null;

  const encoded = hash.slice('#route='.length);
  return decodeRoute(encoded);
}
