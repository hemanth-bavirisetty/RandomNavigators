export type Activity = 'foot' | 'bike';

export type PickingMode = 'start' | 'end' | null;

export type MapStyle = 'dark' | 'light' | 'satellite' | 'terrain' | 'standard';

export type MapOverlays = {
  transport: boolean;
  traffic: boolean;
};

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

export type UserSettings = {
  default_distance: number;
  default_activity: Activity;
  default_map_style: MapStyle;
};

export type AppPage = 'map' | 'profile' | 'settings';
