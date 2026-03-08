import React, { useState } from 'react';
import { BookmarkPlus, Trash2, Route, Share2, Check } from 'lucide-react';
import type { RouteStats as RouteStatsType, Activity } from '../types';
import { generateShareUrl } from '../utils/sharing';

type RouteStatsProps = {
  stats: RouteStatsType;
  coords: [number, number][];
  activity: Activity;
  onSave: () => void;
  onClear: () => void;
};

export default function RouteStats({ stats, coords, activity, onSave, onClear }: RouteStatsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareUrl(coords, stats, activity);

    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'Random Route',
          text: `Check out this ${stats.distance.toFixed(1)}km ${activity === 'foot' ? 'walking' : 'cycling'} route!`,
          url,
        });
        return;
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Final fallback
      prompt('Copy this link:', url);
    }
  };

  return (
    <div className="route-stats">
      <div className="stats-header">
        <div className="stats-icon-wrap">
          <Route size={18} />
        </div>
        <span className="stats-title">Route</span>
        <div className="stats-actions">
          <button onClick={handleShare} className={`stats-action-btn share ${copied ? 'copied' : ''}`} title="Share route">
            {copied ? <Check size={18} /> : <Share2 size={18} />}
          </button>
          <button onClick={onSave} className="stats-action-btn save" title="Save route">
            <BookmarkPlus size={18} />
          </button>
          <button onClick={onClear} className="stats-action-btn delete" title="Clear route">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            {stats.distance.toFixed(1)}
            <span className="stat-unit">km</span>
          </div>
          <div className="stat-label">Distance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(stats.duration)}
            <span className="stat-unit">min</span>
          </div>
          <div className="stat-label">Est. Time</div>
        </div>
      </div>

      {/* Copied toast */}
      {copied && (
        <div className="copied-toast">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
