import React, { useState } from 'react';
import { Layers, X, Bus, Car } from 'lucide-react';
import type { MapStyle, MapOverlays } from '../types';
import { MAP_STYLES, getTrafficOverlayUrl } from '../utils/leaflet';

type MapStylePickerProps = {
  mapStyle: MapStyle;
  overlays: MapOverlays;
  onStyleChange: (style: MapStyle) => void;
  onOverlayToggle: (overlay: keyof MapOverlays) => void;
};

const STYLE_ORDER: MapStyle[] = ['dark', 'light', 'standard', 'satellite', 'terrain'];

export default function MapStylePicker({
  mapStyle,
  overlays,
  onStyleChange,
  onOverlayToggle,
}: MapStylePickerProps) {
  const [open, setOpen] = useState(false);
  const hasTraffic = !!getTrafficOverlayUrl();

  return (
    <div className="map-style-picker">
      <button
        className="map-style-toggle"
        onClick={() => setOpen(!open)}
        title="Map style"
      >
        {open ? <X size={20} /> : <Layers size={20} />}
      </button>

      {open && (
        <div className="map-style-popover">
          <div className="map-style-grid">
            {STYLE_ORDER.map((key) => (
              <button
                key={key}
                className={`map-style-option ${mapStyle === key ? 'active' : ''}`}
                onClick={() => onStyleChange(key)}
              >
                <div className={`map-style-preview ${key}`} />
                <span>{MAP_STYLES[key].label}</span>
              </button>
            ))}
          </div>

          <div className="map-overlay-section">
            <label className="map-overlay-label">Overlays</label>
            <div className="map-overlay-toggles">
              <button
                className={`map-overlay-btn ${overlays.transport ? 'active' : ''}`}
                onClick={() => onOverlayToggle('transport')}
              >
                <Bus size={16} />
                Transit
              </button>
              {hasTraffic && (
                <button
                  className={`map-overlay-btn ${overlays.traffic ? 'active' : ''}`}
                  onClick={() => onOverlayToggle('traffic')}
                >
                  <Car size={16} />
                  Traffic
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
