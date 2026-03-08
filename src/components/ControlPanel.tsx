import React from 'react';
import {
  MapPin,
  Crosshair,
  Activity,
  Navigation,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { Activity as ActivityType, PickingMode } from '../types';

type ControlPanelProps = {
  distanceInput: string;
  onDistanceChange: (val: string) => void;
  activity: ActivityType;
  onActivityChange: (val: ActivityType) => void;
  pickingMode: PickingMode;
  onPickStart: () => void;
  onPickEnd: () => void;
  onUseCurrentLocation: () => void;
  endLocation: [number, number] | null;
  onClearEnd: () => void;
  onGenerate: () => void;
  loading: boolean;
  disabled: boolean;
  error: string | null;
};

export default function ControlPanel({
  distanceInput,
  onDistanceChange,
  activity,
  onActivityChange,
  pickingMode,
  onPickStart,
  onPickEnd,
  onUseCurrentLocation,
  endLocation,
  onClearEnd,
  onGenerate,
  loading,
  disabled,
  error,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      {/* ── Location Pickers ── */}
      <div className="control-section">
        <label className="control-label">Start</label>
        <div className="control-row">
          <button
            onClick={onPickStart}
            className={`control-btn flex-1 ${pickingMode === 'start' ? 'active' : ''}`}
          >
            <MapPin size={16} />
            {pickingMode === 'start' ? 'Tap map…' : 'Pick on map'}
          </button>
          <button
            onClick={onUseCurrentLocation}
            className="control-btn icon-only"
            title="Use current location"
          >
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      <div className="control-section">
        <label className="control-label">End</label>
        <div className="control-row">
          <button
            onClick={onPickEnd}
            className={`control-btn flex-1 ${pickingMode === 'end' ? 'active' : ''}`}
          >
            <MapPin size={16} />
            {pickingMode === 'end'
              ? 'Tap map…'
              : endLocation
              ? 'Change end'
              : 'Loop (same as start)'}
          </button>
          {endLocation && (
            <button onClick={onClearEnd} className="control-btn icon-only danger">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="control-divider" />

      {/* ── Distance ── */}
      <div className="control-section">
        <label className="control-label">Distance</label>
        <div className="distance-input-wrap">
          <input
            type="number"
            min="0.1"
            step="0.5"
            value={distanceInput}
            onChange={(e) => onDistanceChange(e.target.value)}
            className="distance-input"
            placeholder="5.0"
            inputMode="decimal"
          />
          <span className="distance-unit">km</span>
        </div>
        {/* Quick-pick chips */}
        <div className="distance-chips">
          {[1, 3, 5, 10, 15].map((d) => (
            <button
              key={d}
              onClick={() => onDistanceChange(String(d))}
              className={`chip ${distanceInput === String(d) ? 'active' : ''}`}
            >
              {d} km
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity ── */}
      <div className="control-section">
        <label className="control-label">Activity</label>
        <div className="activity-toggle">
          <button
            onClick={() => onActivityChange('foot')}
            className={`activity-btn ${activity === 'foot' ? 'active' : ''}`}
          >
            <Activity size={18} />
            Walk
          </button>
          <button
            onClick={() => onActivityChange('bike')}
            className={`activity-btn ${activity === 'bike' ? 'active' : ''}`}
          >
            <Navigation size={18} />
            Cycle
          </button>
        </div>
      </div>

      {/* ── Generate ── */}
      <button
        onClick={onGenerate}
        disabled={loading || disabled}
        className="generate-btn"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <RefreshCw size={20} />
            Generate Route
          </>
        )}
      </button>

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
