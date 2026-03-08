import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { startIcon, endIcon, DARK_TILE_URL, DARK_TILE_ATTRIBUTION } from '../utils/leaflet';
import type { PickingMode } from '../types';
import { Loader2 } from 'lucide-react';

/* ─── Internal: fit map to route or center ─── */
function MapUpdater({
  center,
  routeCoords,
}: {
  center: [number, number];
  routeCoords: [number, number][] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, routeCoords, map]);

  return null;
}

/* ─── Internal: handle map taps for picking locations ─── */
function MapEventsHandler({
  pickingMode,
  onLocationPicked,
}: {
  pickingMode: PickingMode;
  onLocationPicked: (latlng: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      if (pickingMode) {
        onLocationPicked([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  useEffect(() => {
    if (pickingMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [pickingMode, map]);

  return null;
}

/* ─── Main MapView component ─── */
type MapViewProps = {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  routeCoords: [number, number][] | null;
  pickingMode: PickingMode;
  onLocationPicked: (latlng: [number, number]) => void;
};

export default function MapView({
  startLocation,
  endLocation,
  routeCoords,
  pickingMode,
  onLocationPicked,
}: MapViewProps) {
  if (!startLocation) {
    return (
      <div className="map-loading">
        <Loader2 size={36} className="animate-spin" />
        <p>Finding your location…</p>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={startLocation}
        zoom={14}
        className="map-container"
        zoomControl={false}
      >
        <TileLayer attribution={DARK_TILE_ATTRIBUTION} url={DARK_TILE_URL} />

        <MapUpdater center={startLocation} routeCoords={routeCoords} />
        <MapEventsHandler
          pickingMode={pickingMode}
          onLocationPicked={onLocationPicked}
        />

        <Marker position={startLocation} icon={startIcon} />
        {endLocation && <Marker position={endLocation} icon={endIcon} />}

        {routeCoords && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#00F5A0',
              weight: 4,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>

      {pickingMode && (
        <div className="picking-banner">
          Tap map to set {pickingMode} point
        </div>
      )}
    </div>
  );
}
