import { supabase } from './supabase';
import type { Activity, RouteStats } from '../types';

type SharedRouteData = {
  coords: [number, number][];
  stats: RouteStats;
  activity: Activity;
};

/**
 * Save route to Supabase and return a short share ID.
 */
export async function shareRoute(
  coords: [number, number][],
  stats: RouteStats,
  activity: Activity,
  userId: string
): Promise<string> {
  const routeData = {
    coords,
    distance: stats.distance,
    duration: stats.duration,
    activity,
  };

  const { data, error } = await supabase
    .from('shared_routes')
    .insert({
      route_data: routeData,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/**
 * Load a shared route by its short ID from Supabase.
 */
export async function loadSharedRoute(
  id: string
): Promise<SharedRouteData | null> {
  const { data, error } = await supabase
    .from('shared_routes')
    .select('route_data')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const rd = data.route_data as any;
  return {
    coords: rd.coords,
    stats: { distance: rd.distance, duration: rd.duration },
    activity: rd.activity,
  };
}

/**
 * Generate a full short shareable URL.
 */
export function generateShareUrl(shareId: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#s=${shareId}`;
}

/**
 * Check URL for a short share ID.
 */
export function getShareIdFromUrl(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#s=')) return null;
  return hash.slice(3);
}
