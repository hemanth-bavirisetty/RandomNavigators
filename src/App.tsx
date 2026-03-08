import React, { useState, useEffect } from 'react';
import type { Activity, PickingMode, RouteHistoryItem, AppPage, MapStyle, MapOverlays } from './types';
import { useAuth } from './hooks/useAuth';
import { useGeolocation } from './hooks/useGeolocation';
import { useRouteHistory } from './hooks/useRouteHistory';
import { useRouteGenerator } from './hooks/useRouteGenerator';
import { useSharedRoute } from './hooks/useSharedRoute';
import { useSettings } from './hooks/useSettings';
import AuthPage from './components/AuthPage';
import MapView from './components/MapView';
import BottomSheet from './components/BottomSheet';
import ControlPanel from './components/ControlPanel';
import RouteStatsCard from './components/RouteStats';
import HistoryPanel from './components/HistoryPanel';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { History, Route, X, Settings, User, Loader2 } from 'lucide-react';

export default function App() {
  const auth = useAuth();
  const geo = useGeolocation();
  const { history, save, remove } = useRouteHistory();
  const routeGen = useRouteGenerator();
  const { sharedRoute, clearShared } = useSharedRoute();
  const { settings, updateSettings } = useSettings(auth.user?.id);

  // Apply settings as defaults
  const [distanceInput, setDistanceInput] = useState('5');
  const [activity, setActivity] = useState<Activity>('foot');
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [overlays, setOverlays] = useState<MapOverlays>({ transport: false, traffic: false });

  const [startLocation, setStartLocation] = useState<[number, number] | null>(null);
  const [endLocation, setEndLocation] = useState<[number, number] | null>(null);
  const [pickingMode, setPickingMode] = useState<PickingMode>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [page, setPage] = useState<AppPage>('map');

  // Apply user settings on load
  useEffect(() => {
    setDistanceInput(String(settings.default_distance));
    setActivity(settings.default_activity);
    setMapStyle(settings.default_map_style);
  }, [settings]);

  const effectiveStart = startLocation ?? geo.location;

  // Load shared route
  useEffect(() => {
    if (sharedRoute) {
      routeGen.loadRoute(sharedRoute.coords, sharedRoute.stats);
      setActivity(sharedRoute.activity);
      setIsSharedView(true);
      clearShared();
    }
  }, [sharedRoute]);

  // Auth loading
  if (auth.loading) {
    return (
      <div className="auth-loading">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!auth.user) {
    return (
      <AuthPage
        onSignInEmail={auth.signInWithEmail}
        onSignUpEmail={auth.signUpWithEmail}
        onSignInGoogle={auth.signInWithGoogle}
      />
    );
  }

  // ── Handlers ──
  const handleLocationPicked = (latlng: [number, number]) => {
    if (pickingMode === 'start') setStartLocation(latlng);
    else if (pickingMode === 'end') setEndLocation(latlng);
    setPickingMode(null);
  };

  const handleGenerate = () => {
    if (!effectiveStart) return;
    routeGen.generate(effectiveStart, endLocation, parseFloat(distanceInput), activity);
    setIsSharedView(false);
  };

  const handleSave = () => {
    if (!routeGen.routeCoords || !routeGen.routeStats) return;
    save({ distance: routeGen.routeStats.distance, duration: routeGen.routeStats.duration, activity, coords: routeGen.routeCoords });
  };

  const handleLoadHistory = (item: RouteHistoryItem) => {
    routeGen.loadRoute(item.coords, { distance: item.distance, duration: item.duration });
    setActivity(item.activity);
    setShowHistory(false);
    setIsSharedView(false);
  };

  const handleClear = () => {
    routeGen.clear();
    setIsSharedView(false);
  };

  const handleOverlayToggle = (key: keyof MapOverlays) => {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Peek content ──
  const peekContent = routeGen.routeStats ? (
    <div className="peek-stats">
      <Route size={16} />
      <span className="peek-stat">{routeGen.routeStats.distance.toFixed(1)} km</span>
      <span className="peek-sep">·</span>
      <span className="peek-stat">{Math.round(routeGen.routeStats.duration)} min</span>
    </div>
  ) : (
    <div className="peek-stats">
      <Route size={16} />
      <span className="peek-label">Set up your route</span>
    </div>
  );

  // ── User avatar ──
  const avatarUrl = auth.user.user_metadata?.avatar_url || auth.user.user_metadata?.picture;

  return (
    <div className="app">
      <MapView
        startLocation={effectiveStart}
        endLocation={endLocation}
        routeCoords={routeGen.routeCoords}
        pickingMode={pickingMode}
        onLocationPicked={handleLocationPicked}
        mapStyle={mapStyle}
        overlays={overlays}
        onStyleChange={setMapStyle}
        onOverlayToggle={handleOverlayToggle}
      />

      {isSharedView && (
        <div className="shared-banner">
          <span>Viewing a shared route</span>
          <button onClick={handleClear} className="shared-banner-close">
            <X size={16} />
          </button>
        </div>
      )}

      <BottomSheet peekContent={peekContent}>
        {page === 'profile' ? (
          <ProfilePage
            user={auth.user}
            history={history}
            onBack={() => setPage('map')}
            onSignOut={auth.signOut}
          />
        ) : page === 'settings' ? (
          <SettingsPage
            settings={settings}
            onUpdate={updateSettings}
            onBack={() => setPage('map')}
          />
        ) : showHistory ? (
          <HistoryPanel
            history={history}
            onLoad={handleLoadHistory}
            onDelete={remove}
            onBack={() => setShowHistory(false)}
          />
        ) : (
          <>
            <div className="panel-header">
              <h1 className="panel-title">Random Route</h1>
              <div className="panel-header-actions">
                <button className="header-icon-btn" onClick={() => setShowHistory(true)} title="Saved routes">
                  <History size={18} />
                  {history.length > 0 && <span className="history-badge">{history.length}</span>}
                </button>
                <button className="header-icon-btn" onClick={() => setPage('settings')} title="Settings">
                  <Settings size={18} />
                </button>
                <button className="header-avatar-btn" onClick={() => setPage('profile')} title="Profile">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="header-avatar-img" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={18} />
                  )}
                </button>
              </div>
            </div>

            <ControlPanel
              distanceInput={distanceInput}
              onDistanceChange={setDistanceInput}
              activity={activity}
              onActivityChange={setActivity}
              pickingMode={pickingMode}
              onPickStart={() => setPickingMode(pickingMode === 'start' ? null : 'start')}
              onPickEnd={() => setPickingMode(pickingMode === 'end' ? null : 'end')}
              onUseCurrentLocation={() => {
                if (geo.location) setStartLocation(geo.location);
                geo.refresh();
              }}
              endLocation={endLocation}
              onClearEnd={() => setEndLocation(null)}
              onGenerate={handleGenerate}
              loading={routeGen.loading}
              disabled={!effectiveStart}
              error={routeGen.error}
            />

            {routeGen.routeStats && routeGen.routeCoords && (
              <RouteStatsCard
                stats={routeGen.routeStats}
                coords={routeGen.routeCoords}
                activity={activity}
                userId={auth.user.id}
                onSave={handleSave}
                onClear={handleClear}
              />
            )}
          </>
        )}
      </BottomSheet>
    </div>
  );
}
