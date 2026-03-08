import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { UserSettings, MapStyle, Activity } from '../types';
import { MAP_STYLES } from '../utils/leaflet';

type SettingsPageProps = {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onBack: () => void;
};

const STYLE_OPTIONS: MapStyle[] = ['dark', 'light', 'standard', 'satellite', 'terrain'];

export default function SettingsPage({
  settings,
  onUpdate,
  onBack,
}: SettingsPageProps) {
  return (
    <div className="sub-page">
      <div className="sub-page-header">
        <button onClick={onBack} className="sub-page-back">
          <ChevronLeft size={20} />
        </button>
        <h2 className="sub-page-title">Settings</h2>
      </div>

      {/* Default Distance */}
      <div className="settings-section">
        <label className="settings-label">Default Distance</label>
        <div className="distance-input-wrap">
          <input
            type="number"
            min="0.1"
            step="0.5"
            value={settings.default_distance}
            onChange={(e) =>
              onUpdate({ default_distance: parseFloat(e.target.value) || 5 })
            }
            className="distance-input"
            inputMode="decimal"
          />
          <span className="distance-unit">km</span>
        </div>
      </div>

      {/* Default Activity */}
      <div className="settings-section">
        <label className="settings-label">Default Activity</label>
        <div className="activity-toggle">
          <button
            onClick={() => onUpdate({ default_activity: 'foot' })}
            className={`activity-btn ${settings.default_activity === 'foot' ? 'active' : ''}`}
          >
            Walk
          </button>
          <button
            onClick={() => onUpdate({ default_activity: 'bike' })}
            className={`activity-btn ${settings.default_activity === 'bike' ? 'active' : ''}`}
          >
            Cycle
          </button>
        </div>
      </div>

      {/* Default Map Style */}
      <div className="settings-section">
        <label className="settings-label">Default Map Style</label>
        <div className="settings-style-list">
          {STYLE_OPTIONS.map((key) => (
            <button
              key={key}
              className={`settings-style-option ${settings.default_map_style === key ? 'active' : ''}`}
              onClick={() => onUpdate({ default_map_style: key })}
            >
              <div className={`map-style-preview ${key}`} />
              <span>{MAP_STYLES[key].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-note">
        Settings are saved automatically.
      </div>
    </div>
  );
}
