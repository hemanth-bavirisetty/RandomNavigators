import { useState, useEffect, useCallback } from 'react';

const DEFAULT_LOCATION: [number, number] = [13.0827, 80.2707]; // Chennai fallback

export function useGeolocation() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, refresh: requestLocation };
}
