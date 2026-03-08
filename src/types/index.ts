export type Activity = 'foot' | 'bike';

export type PickingMode = 'start' | 'end' | null;

export type RouteHistoryItem = {
  id: string;
  distance: number;
  duration: number;
  activity: Activity;
  date: string;
  coords: [number, number][];
};

export type RouteStats = {
  distance: number;
  duration: number;
};
