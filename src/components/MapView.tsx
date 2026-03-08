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
import { startIcon, endIcon, MAP_STYLES, TRANSPORT_OVERLAY, getTrafficOverlayUrl } from '../utils/leaflet';
import type { PickingMode, MapStyle, MapOverlays } from '../types';
import { Loader2 } from 'lucide-react';
import MapStylePicker from './MapStylePicker';

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

/* ─── Internal: handle map taps ─── */
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
    map.getContainer().style.cursor = pickingMode ? 'crosshair' : '';
  }, [pickingMode, map]);

  return null;
}

/* ─── Determine route line color for visibility ─── */
function getRouteColor(style: MapStyle): string {
  switch (style) {
    case 'light':
    case 'standard':
    case 'terrain':
      return '#059669'; // darker green on light backgrounds
    default:
      return '#00F5A0'; // bright green on dark backgrounds
  }
}

/* ─── Main MapView ─── */
type MapViewProps = {
  startLocation: [number, number] | null;
  endLocation: [number, number] | null;
  routeCoords: [number, number][] | null;
  pickingMode: PickingMode;
  onLocationPicked: (latlng: [number, number]) => void;
  mapStyle: MapStyle;
  overlays: MapOverlays;
  onStyleChange: (style: MapStyle) => void;
  onOverlayToggle: (overlay: keyof MapOverlays) => void;
};

export default function MapView({
  startLocation,
  endLocation,
  routeCoords,
  pickingMode,
  onLocationPicked,
  mapStyle,
  overlays,
  onStyleChange,
  onOverlayToggle,
}: MapViewProps) {
  const tile = MAP_STYLES[mapStyle];
  const trafficUrl = getTrafficOverlayUrl();

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
        {/* Base tile layer */}
        <TileLayer key={mapStyle} attribution={tile.attribution} url={tile.url} />

        {/* Overlay: Public Transport */}
        {overlays.transport && (
          <TileLayer
            url={TRANSPORT_OVERLAY.url}
            attribution={TRANSPORT_OVERLAY.attribution}
            opacity={0.7}
          />
        )}

        {/* Overlay: Traffic */}
        {overlays.traffic && trafficUrl && (
          <TileLayer url={trafficUrl} opacity={0.6} />
        )}

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
              color: getRouteColor(mapStyle),
              weight: 4,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>

      {/* Map style picker floating button */}
      <MapStylePicker
        mapStyle={mapStyle}
        overlays={overlays}
        onStyleChange={onStyleChange}
        onOverlayToggle={onOverlayToggle}
      />

      {pickingMode && (
        <div className="picking-banner">
          Tap map to set {pickingMode} point
        </div>
      )}
    </div>
  );
}
