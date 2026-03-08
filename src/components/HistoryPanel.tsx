import React from 'react';
import { ChevronLeft, Trash2, Activity, Navigation } from 'lucide-react';
import type { RouteHistoryItem } from '../types';

type HistoryPanelProps = {
  history: RouteHistoryItem[];
  onLoad: (item: RouteHistoryItem) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
};

export default function HistoryPanel({
  history,
  onLoad,
  onDelete,
  onBack,
}: HistoryPanelProps) {
  return (
    <div className="history-panel">
      <div className="history-header">
        <button onClick={onBack} className="history-back-btn">
          <ChevronLeft size={20} />
        </button>
        <h2 className="history-title">Saved Routes</h2>
        <span className="history-count">{history.length}</span>
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <p>No saved routes yet</p>
          <span>Generate a route and save it to see it here.</span>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onLoad(item)}
              className="history-card"
            >
              <div className="history-card-top">
                <div className="history-card-activity">
                  {item.activity === 'foot' ? (
                    <Activity size={14} />
                  ) : (
                    <Navigation size={14} />
                  )}
                  <span>{item.activity === 'foot' ? 'Walk' : 'Cycle'}</span>
                </div>
                <span className="history-card-date">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>

              <div className="history-card-stats">
                <span className="history-stat">
                  {item.distance.toFixed(1)} km
                </span>
                <span className="history-stat-sep">·</span>
                <span className="history-stat">
                  {Math.round(item.duration)} min
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="history-delete-btn"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
