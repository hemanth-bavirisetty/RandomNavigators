import React from 'react';
import { ChevronLeft, MapPin, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { RouteHistoryItem } from '../types';

type ProfilePageProps = {
  user: User;
  history: RouteHistoryItem[];
  onBack: () => void;
  onSignOut: () => void;
};

export default function ProfilePage({
  user,
  history,
  onBack,
  onSignOut,
}: ProfilePageProps) {
  const meta = user.user_metadata;
  const avatarUrl = meta?.avatar_url || meta?.picture;
  const name = meta?.full_name || meta?.name || 'User';
  const email = user.email || '';

  const totalRoutes = history.length;
  const totalDistance = history.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = history.reduce((sum, r) => sum + r.duration, 0);

  return (
    <div className="sub-page">
      <div className="sub-page-header">
        <button onClick={onBack} className="sub-page-back">
          <ChevronLeft size={20} />
        </button>
        <h2 className="sub-page-title">Profile</h2>
      </div>

      <div className="profile-card">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="profile-avatar" referrerPolicy="no-referrer" />
        ) : (
          <div className="profile-avatar-placeholder">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="profile-name">{name}</div>
        <div className="profile-email">{email}</div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat">
          <div className="profile-stat-value">{totalRoutes}</div>
          <div className="profile-stat-label">Routes</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-value">{totalDistance.toFixed(1)}</div>
          <div className="profile-stat-label">km Total</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-value">{Math.round(totalDuration)}</div>
          <div className="profile-stat-label">min Total</div>
        </div>
      </div>

      <button onClick={onSignOut} className="profile-signout-btn">
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}
