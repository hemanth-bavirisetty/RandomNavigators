import React, { useState, useEffect } from 'react';
import type { Activity, PickingMode, RouteHistoryItem } from './types';
import { useAuth } from './hooks/useAuth';
import { useGeolocation } from './hooks/useGeolocation';
import { useRouteHistory } from './hooks/useRouteHistory';
import { useRouteGenerator } from './hooks/useRouteGenerator';
import { useSharedRoute } from './hooks/useSharedRoute';
import AuthPage from './components/AuthPage';
import MapView from './components/MapView';
import BottomSheet from './components/BottomSheet';
import ControlPanel from './components/ControlPanel';
import RouteStatsCard from './components/RouteStats';
import HistoryPanel from './components/HistoryPanel';
import { History, Route, X, LogOut, Loader2 } from 'lucide-react';

export default function App() {
  const auth = useAuth();
  const geo = useGeolocation();
  const { history, save, remove } = useRouteHistory();
  const route = useRouteGenerator();
  const { sharedRoute, clearShared } = useSharedRoute();

  const [distanceInput, setDistanceInput] = useState('5');
  const [activity, setActivity] = useState<Activity>('foot');
  const [startLocation, setStartLocation] = useState<[number, number] | null>(null);
  const [endLocation, setEndLocation] = useState<[number, number] | null>(null);
  const [pickingMode, setPickingMode] = useState<PickingMode>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  const effectiveStart = startLocation ?? geo.location;

  // Load shared route if present
  useEffect(() => {
    if (sharedRoute) {
      route.loadRoute(sharedRoute.coords, sharedRoute.stats);
      setActivity(sharedRoute.activity);
      setIsSharedView(true);
      clearShared();
    }
  }, [sharedRoute]);

  // ── Auth loading state ──
  if (auth.loading) {
    return (
      <div className="auth-loading">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  // ── Not logged in → show auth page ──
  if (!auth.user) {
    return (
      <AuthPage
        onSignInEmail={auth.signInWithEmail}
        onSignUpEmail={auth.signUpWithEmail}
        onSignInGoogle={auth.signInWithGoogle}
      />
    );
  }

  // ── Logged in → route app ──
  const handleLocationPicked = (latlng: [number, number]) => {
    if (pickingMode === 'start') setStartLocation(latlng);
    else if (pickingMode === 'end') setEndLocation(latlng);
    setPickingMode(null);
  };

  const handleGenerate = () => {
    if (!effectiveStart) return;
    const distance = parseFloat(distanceInput);
    route.generate(effectiveStart, endLocation, distance, activity);
    setIsSharedView(false);
  };

  const handleSave = () => {
    if (!route.routeCoords || !route.routeStats) return;
    save({
      distance: route.routeStats.distance,
      duration: route.routeStats.duration,
      activity,
      coords: route.routeCoords,
    });
  };

  const handleLoadHistory = (item: RouteHistoryItem) => {
    route.loadRoute(item.coords, { distance: item.distance, duration: item.duration });
    setActivity(item.activity);
    setShowHistory(false);
    setIsSharedView(false);
  };

  const handleClear = () => {
    route.clear();
    setIsSharedView(false);
  };

  const peekContent = route.routeStats ? (
    <div className="peek-stats">
      <Route size={16} />
      <span className="peek-stat">{route.routeStats.distance.toFixed(1)} km</span>
      <span className="peek-sep">·</span>
      <span className="peek-stat">{Math.round(route.routeStats.duration)} min</span>
    </div>
  ) : (
    <div className="peek-stats">
      <Route size={16} />
      <span className="peek-label">Set up your route</span>
    </div>
  );

  return (
    <div className="app">
      <MapView
        startLocation={effectiveStart}
        endLocation={endLocation}
        routeCoords={route.routeCoords}
        pickingMode={pickingMode}
        onLocationPicked={handleLocationPicked}
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
        {showHistory ? (
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
                <button
                  className="history-toggle-btn"
                  onClick={() => setShowHistory(true)}
                  title="Saved routes"
                >
                  <History size={20} />
                  {history.length > 0 && (
                    <span className="history-badge">{history.length}</span>
                  )}
                </button>
                <button
                  className="signout-btn"
                  onClick={auth.signOut}
                  title="Sign out"
                >
                  <LogOut size={18} />
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
              loading={route.loading}
              disabled={!effectiveStart}
              error={route.error}
            />

            {route.routeStats && route.routeCoords && (
              <RouteStatsCard
                stats={route.routeStats}
                coords={route.routeCoords}
                activity={activity}
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
