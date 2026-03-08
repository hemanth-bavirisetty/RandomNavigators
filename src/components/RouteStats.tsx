import React, { useState } from 'react';
import { BookmarkPlus, Trash2, Route, Share2, Check, Loader2 } from 'lucide-react';
import type { RouteStats as RouteStatsType, Activity } from '../types';
import { shareRoute, generateShareUrl } from '../utils/sharing';

type RouteStatsProps = {
  stats: RouteStatsType;
  coords: [number, number][];
  activity: Activity;
  userId: string;
  onSave: () => void;
  onClear: () => void;
};

export default function RouteStats({ stats, coords, activity, userId, onSave, onClear }: RouteStatsProps) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const shareId = await shareRoute(coords, stats, activity, userId);
      const url = generateShareUrl(shareId);

      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'Random Route',
          text: `Check out this ${stats.distance.toFixed(1)}km ${activity === 'foot' ? 'walking' : 'cycling'} route!`,
          url,
        });
        setSharing(false);
        return;
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setSharing(false);
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      console.error('Share failed:', err);
      setSharing(false);
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
          <button
            onClick={handleShare}
            disabled={sharing}
            className={`stats-action-btn share ${copied ? 'copied' : ''}`}
            title="Share route"
          >
            {sharing ? <Loader2 size={16} className="animate-spin" /> : copied ? <Check size={18} /> : <Share2 size={18} />}
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

      {copied && (
        <div className="copied-toast">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
