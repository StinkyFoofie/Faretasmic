import React, { useState, useEffect } from 'react';
import { Route, ThemeId, ToastMessage, VerifiedSpot, CabinClass } from './types';
import { APP_CONFIG, THEMES_LIST } from './config';
import { Header } from './components/Header';
import { OraclePanel } from './components/OraclePanel';
import { PriceChart } from './components/PriceChart';
import { TargetSurveillanceBox } from './components/TargetSurveillanceBox';
import { ItineraryDetails } from './components/ItineraryDetails';
import { HistoryLog } from './components/HistoryLog';
import { Toast } from './components/Toast';
import { useOutsideClick } from './hooks/useOutsideClick';

import { ThemeModal } from './components/Modals/ThemeModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ManualTrueUpModal } from './components/Modals/ManualTrueUpModal';
import { FetchOverrideModal } from './components/Modals/FetchOverrideModal';
import { UntrackConfirmModal } from './components/Modals/UntrackConfirmModal';
import { ValidationErrorModal } from './components/Modals/ValidationErrorModal';
import { FlightRouterModal } from './components/Modals/FlightRouterModal';
import { AddFlightModal } from './components/Modals/AddFlightModal';

import { SEED_ROUTE, generateAeroFluxTrajectory, generateCabinSpecificTrajectory } from './engine/aeroflux';

const DISNEY_THEMES = new Set<string>([
  'fantasmic-sorcerer',
  'tomorrowland-tron',
  'haunted-mansion',
  'forbidden-mountain',
  'main-street-sunshine',
  'cinderella-castle',
  'neverland-skies',
  'epcot-spaceship-earth',
]);

export const App: React.FC = () => {
  // Theme state (Default to Fantasmic Sorcerer, fallback for legacy themes)
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved && DISNEY_THEMES.has(saved)) {
      return saved as ThemeId;
    }
    return 'fantasmic-sorcerer';
  });

  // Apply theme to body and synchronize document head meta theme-color (Proposal 2)
  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
    localStorage.setItem('app_theme', activeTheme);

    const style = getComputedStyle(document.body);
    const bg = style.getPropertyValue('--bg-base').trim();
    if (bg) {
      let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = bg;
    }
  }, [activeTheme]);

  // Quota and telemetry state
  const [apiFetches, setApiFetches] = useState<number>(() => {
    const saved = localStorage.getItem('faretasmic_fetches');
    return saved !== null ? parseInt(saved) : 412;
  });
  const [isShieldEnabled, setIsShieldEnabled] = useState<boolean>(true);
  const [lockThreshold, setLockThreshold] = useState<number>(
    APP_CONFIG.DEFAULT_FAILSAFE_LOCKOUT_CALLS
  );

  useEffect(() => {
    localStorage.setItem('faretasmic_fetches', apiFetches.toString());
  }, [apiFetches]);

  // Monitored routes state (defaults to 🌱 Seed route if empty)
  const [routes, setRoutes] = useState<Route[]>(() => {
    try {
      const saved = localStorage.getItem('faretasmic_routes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved routes:', e);
    }
    return [SEED_ROUTE];
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('faretasmic_routes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return SEED_ROUTE.id;
  });

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || null;

  // Active cabin view selection (synchronized between chart, target box, and oracle)
  const [activeCabin, setActiveCabin] = useState<CabinClass>(() => {
    return activeRoute?.cabin || 'economy';
  });

  // Keep activeCabin in sync when route changes
  useEffect(() => {
    if (activeRoute?.cabin) {
      setActiveCabin(activeRoute.cabin);
    }
  }, [selectedRouteId]);

  useEffect(() => {
    localStorage.setItem('faretasmic_routes', JSON.stringify(routes));
    if (routes.length === 0) {
      setSelectedRouteId(null);
    } else if (!selectedRouteId || !routes.some((r) => r.id === selectedRouteId)) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes, selectedRouteId]);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, isCelebration?: boolean) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text, isCelebration }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, collapsing: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 5000);
  };

  // Celestial Target Hit Celebration (Proposal 3)
  useEffect(() => {
    if (!activeRoute) return;
    const target = activeRoute.targetFares?.[activeCabin];
    if (target !== undefined) {
      const effPoints = generateCabinSpecificTrajectory(activeRoute, activeCabin);
      const effectiveCurrentPrice = effPoints[0] || activeRoute.currentPrice;
      if (effectiveCurrentPrice <= target) {
        const isCelebrated =
          typeof activeRoute.isTargetHitCelebrated === 'object' && activeRoute.isTargetHitCelebrated !== null
            ? (activeRoute.isTargetHitCelebrated as Partial<Record<CabinClass, boolean>>)[activeCabin]
            : false;

        if (!isCelebrated) {
          showToast(
            `🎉 CELESTIAL TARGET HIT! ${activeRoute.tag} (${activeCabin.toUpperCase()}) reached $${effectiveCurrentPrice} (Target: $${target})! 🚀`,
            true
          );
          setRoutes((prev) =>
            prev.map((r) =>
              r.id === activeRoute.id
                ? {
                    ...r,
                    isTargetHitCelebrated: {
                      ...(typeof r.isTargetHitCelebrated === 'object' && r.isTargetHitCelebrated !== null
                        ? r.isTargetHitCelebrated
                        : {}),
                      [activeCabin]: true,
                    },
                  }
                : r
            )
          );
        }
      }
    }
  }, [activeRoute?.id, activeRoute?.currentPrice, activeCabin, activeRoute?.targetFares]);

  // Modals state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFetchOverrideModalOpen, setIsFetchOverrideModalOpen] = useState(false);
  const [isManualTrueUpModalOpen, setIsManualTrueUpModalOpen] = useState(false);
  const [isUntrackModalOpen, setIsUntrackModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isFlightRouterModalOpen, setIsFlightRouterModalOpen] = useState(false);
  const [isAddFlightModalOpen, setIsAddFlightModalOpen] = useState(false);

  // Route selector dropdown open state
  const [isRouteSelectorOpen, setIsRouteSelectorOpen] = useState(false);
  const routeSelectorRef = useOutsideClick<HTMLDivElement>(isRouteSelectorOpen, () =>
    setIsRouteSelectorOpen(false)
  );

  // Manage body scroll lock
  const isAnyModalOpen =
    isThemeModalOpen ||
    isSettingsModalOpen ||
    isFetchOverrideModalOpen ||
    isManualTrueUpModalOpen ||
    isUntrackModalOpen ||
    isValidationModalOpen ||
    isFlightRouterModalOpen ||
    isAddFlightModalOpen;

  useEffect(() => {
    document.body.classList.toggle('modal-open', isAnyModalOpen);
  }, [isAnyModalOpen]);

  // Calculations
  const callsRemaining = APP_CONFIG.MAXIMUM_FREE_TIER_MONTHLY_CALLS - apiFetches;
  const maxMonitors = Math.max(0, Math.floor(callsRemaining / (2 * 30 + 14)));

  // Actions
  const handleSelectTheme = (themeId: ThemeId | 'random') => {
    if (themeId === 'random') {
      const themesOnly = THEMES_LIST.filter((t) => !t.isRandom).map((t) => t.id as ThemeId);
      const chosen = themesOnly[Math.floor(Math.random() * themesOnly.length)];
      setActiveTheme(chosen);
    } else {
      setActiveTheme(themeId);
    }
  };

  const handleSaveSettings = (threshold: number, shieldEnabled: boolean) => {
    setLockThreshold(threshold);
    setIsShieldEnabled(shieldEnabled);
    setIsSettingsModalOpen(false);
    showToast(APP_CONFIG.TOAST_SETTINGS_SAVED);
  };

  const handleUpdateFetches = (newCount: number) => {
    setApiFetches(newCount);
    setIsFetchOverrideModalOpen(false);
  };

  const handleExecuteLiveSweep = () => {
    if (activeRoute) {
      setApiFetches((prev) => prev + activeRoute.horizon);
      setIsManualTrueUpModalOpen(false);
      showToast(`⚡ Manual sweep completed: +${activeRoute.horizon} fetches recorded.`);
    }
  };

  const handleLogManualFare = (spot: {
    fare: number;
    carrier: string;
    leg: 'outbound' | 'return' | 'both';
    note: string;
  }) => {
    if (!activeRoute) return;

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });

    const newDataPoints = [...activeRoute.dataPoints];
    if (spot.leg === 'outbound' || spot.leg === 'both') {
      newDataPoints[0] = spot.fare;
    }
    if (spot.leg === 'return' || spot.leg === 'both') {
      newDataPoints[activeRoute.horizon - 1] = spot.fare;
    }

    const dayTarget = spot.leg === 'return' ? activeRoute.horizon - 1 : 0;
    const newSpot: VerifiedSpot = {
      dayIndex: dayTarget,
      price: spot.fare,
      date: new Date().toISOString().split('T')[0],
      carrier: spot.carrier,
      note: spot.note,
      leg: spot.leg,
    };

    const updatedSpots = [
      ...(activeRoute.verifiedSpots || []).filter((s) => s.dayIndex !== dayTarget),
      newSpot,
    ];

    const noteText = spot.note ? ` — ${spot.note}` : '';
    const newLogItem = `${todayStr} : ${spot.carrier} ($${spot.fare.toFixed(2)} Spot)${noteText}`;
    const nextLogs = [newLogItem, ...activeRoute.historyLog];
    if (nextLogs.length > 6) nextLogs.pop();

    const updatedRoutes = routes.map((r) => {
      if (r.id === activeRoute.id) {
        return {
          ...r,
          currentPrice: spot.fare,
          dataPoints: newDataPoints,
          historyLog: nextLogs,
          latestNote: spot.note || r.latestNote,
          verifiedSpots: updatedSpots,
        };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    setIsManualTrueUpModalOpen(false);
    showToast(`📌 Verified Fare Logged: $${spot.fare.toFixed(2)} (0 API Calls)`);
  };

  const handleUntrackRoute = () => {
    if (!selectedRouteId) return;
    const remaining = routes.filter((r) => r.id !== selectedRouteId);
    setRoutes(remaining);
    setSelectedRouteId(remaining.length > 0 ? remaining[0].id : null);
    setIsUntrackModalOpen(false);
    showToast('🗑️ Route untracked and records purged.');
  };

  const handleAddRoute = (newRoute: Route) => {
    setRoutes((prev) => [...prev, newRoute]);
    setSelectedRouteId(newRoute.id);
    setActiveCabin(newRoute.cabin || 'economy');
    setIsAddFlightModalOpen(false);
    showToast(`${APP_CONFIG.TOAST_FLIGHT_ADDED} (${newRoute.origin} ➔ ${newRoute.dest})`);
  };

  // 🎯 Target Fare Management (Multi-Cabin Memory - Proposal 1)
  const handleUpdateTargetFare = (cabin: CabinClass, fare: number | undefined) => {
    if (!activeRoute) return;
    const updatedTargets = { ...(activeRoute.targetFares || {}) };
    const updatedCelebrations: Partial<Record<CabinClass, boolean>> =
      typeof activeRoute.isTargetHitCelebrated === 'object' && activeRoute.isTargetHitCelebrated !== null
        ? { ...activeRoute.isTargetHitCelebrated }
        : {};

    if (fare !== undefined) {
      updatedTargets[cabin] = fare;
      // Reset celebration if user raised or updated the target
      delete updatedCelebrations[cabin];
    } else {
      delete updatedTargets[cabin];
      delete updatedCelebrations[cabin];
    }

    const updatedRoutes = routes.map((r) =>
      r.id === activeRoute.id
        ? { ...r, targetFares: updatedTargets, isTargetHitCelebrated: updatedCelebrations }
        : r
    );
    setRoutes(updatedRoutes);
    if (fare !== undefined) {
      showToast(`🎯 Target fare for ${cabin.toUpperCase()} set to $${fare} ${activeRoute.currency}`);
    }
  };

  // 🎯 1-Click Smart Target Auto-Anchor (Proposal 2)
  const handleAutoAnchorTarget = (cabin: CabinClass) => {
    if (!activeRoute) return;
    const effectivePrices = generateCabinSpecificTrajectory(activeRoute, cabin);
    const sorted = [...effectivePrices].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)] || effectivePrices[0];

    handleUpdateTargetFare(cabin, p25);
    showToast(`🎯 Auto-anchored ${cabin.toUpperCase()} target to 25th percentile: $${p25} ${activeRoute.currency}`);
  };

  // 🌀 Fauxrecast Handler (AeroFlux Engine)
  const handleFauxrecast = () => {
    if (!activeRoute) return;

    const aeroSim = generateAeroFluxTrajectory({
      origin: activeRoute.origin,
      dest: activeRoute.dest,
      horizon: activeRoute.horizon,
      currency: activeRoute.currency,
      cabin: activeRoute.cabin,
      pax: activeRoute.pax,
      depDate: activeRoute.depDate,
    });

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });

    const carriers =
      activeRoute.airlines && activeRoute.airlines.length > 0
        ? activeRoute.airlines
        : ['DL', 'AC', 'UA', 'AA', 'JL'];
    const rndCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const rndFlight = Math.floor(Math.random() * 900) + 100;
    const eventSuffix = aeroSim.marketEventDescription
      ? ` [${aeroSim.marketEventDescription}]`
      : '';
    const newLogItem = `${todayStr} : ${rndCarrier} ${rndFlight} ($${aeroSim.currentPrice}.00 Fauxrecast)${eventSuffix}`;

    const updatedRoutes = routes.map((r) => {
      if (r.id === activeRoute.id) {
        const nextLogs = [newLogItem, ...r.historyLog];
        if (nextLogs.length > 6) nextLogs.pop();
        return {
          ...r,
          currentPrice: aeroSim.currentPrice,
          dataPoints: aeroSim.dataPoints,
          holidayDays: aeroSim.holidayDays,
          historyLog: nextLogs,
          latestNote: aeroSim.marketEventDescription || r.latestNote,
        };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    showToast(APP_CONFIG.TOAST_FAUXRECAST_GENERATED);
  };

  // CSV Export with Verified Spots & Notes
  const handleExportCSV = () => {
    if (!activeRoute) return;
    const headers = [
      'Day',
      'Date',
      'Price',
      'Currency',
      'Origin',
      'Destination',
      'TripType',
      'Passengers',
      'Cabin',
      'StopFilter',
      'VerifiedSpot',
      'ObservationNotes',
    ];

    const baseDate = new Date();
    const rows = activeRoute.dataPoints.map((price, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];

      const matchingSpot = activeRoute.verifiedSpots?.find((s) => s.dayIndex === idx);
      const isVerified = matchingSpot ? `Yes (${matchingSpot.carrier || 'Verified'})` : 'Synthetic Flux';
      const cleanNote = matchingSpot?.note
        ? matchingSpot.note.replace(/"/g, '""')
        : idx === 0 && activeRoute.latestNote
        ? activeRoute.latestNote.replace(/"/g, '""')
        : '';

      return [
        idx + 1,
        dateStr,
        price.toFixed(2),
        activeRoute.currency,
        activeRoute.origin,
        activeRoute.dest,
        activeRoute.tripType,
        activeRoute.pax,
        activeRoute.cabin,
        activeRoute.stopFilter,
        `"${isVerified}"`,
        `"${cleanNote}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `faretasmic_${activeRoute.origin}_${activeRoute.dest}_trajectory.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📥 EXPORT CSV: Verified Trajectory downloaded');
  };

  const handleFireRouterStub = (targetName: string) => {
    showToast(`🔗 Link routing to ${targetName} staged for API Phase`);
  };

  return (
    <>
      <Toast toasts={toasts} />

      <div className="app-container">
        {/* Header & Telemetry Tray */}
        <Header
          apiFetches={apiFetches}
          maxFetches={APP_CONFIG.MAXIMUM_FREE_TIER_MONTHLY_CALLS}
          isShieldEnabled={isShieldEnabled}
          lockThreshold={lockThreshold}
          onOpenTheme={() => setIsThemeModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onShuffleQA={handleFauxrecast}
          hasActiveRoute={!!activeRoute}
        />

        {/* Main Split Architecture */}
        <div className="main-grid">
          {/* Left Column: Controls, Target Box & Oracle */}
          <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="panel">
              <div className="panel-title" style={{ textAlign: 'center' }}>
                ✈️ POOHTRAX (<span id="ui-monitor-count">{routes.length}</span> /{' '}
                <span id="ui-monitor-max">{maxMonitors}</span>)
              </div>

              {/* Custom Select: Active Monitors */}
              <div
                ref={routeSelectorRef}
                className={`custom-select ${isRouteSelectorOpen ? 'open' : ''}`}
                id="cs-active-monitor"
              >
                <div
                  className="custom-select-trigger"
                  onClick={() => setIsRouteSelectorOpen(!isRouteSelectorOpen)}
                >
                  <span className="c-text">
                    {activeRoute
                      ? `🏷️ ${activeRoute.tag} (${activeRoute.origin} ➔ ${activeRoute.dest}) [${activeRoute.currency}]`
                      : APP_CONFIG.PLACEHOLDER_SELECT_ROUTE}
                  </span>
                  <span className="c-arrow">▼</span>
                </div>

                {isRouteSelectorOpen && (
                  <div className="custom-select-options" style={{ display: 'block' }}>
                    <div
                      className={`custom-option ${!activeRoute ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedRouteId(null);
                        setIsRouteSelectorOpen(false);
                      }}
                    >
                      {APP_CONFIG.PLACEHOLDER_SELECT_ROUTE}
                    </div>
                    {routes.map((r) => (
                      <div
                        key={r.id}
                        className={`custom-option ${selectedRouteId === r.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedRouteId(r.id);
                          setIsRouteSelectorOpen(false);
                        }}
                      >
                        🏷️ {r.tag} ({r.origin} ➔ {r.dest}) [{r.currency}]
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row btn-group-equal" style={{ marginTop: '5px' }}>
                <button
                  className="primary-btn"
                  id="ui-btn-add-flight-main"
                  onClick={() => setIsAddFlightModalOpen(true)}
                >
                  {APP_CONFIG.BTN_ADD_FLIGHT_MAIN}
                </button>
                <button
                  className="secondary-btn"
                  id="btn-manual-fetch"
                  disabled={!activeRoute}
                  onClick={() => setIsManualTrueUpModalOpen(true)}
                >
                  ⚡ True-Up / Spot
                </button>
              </div>
            </div>

            {/* Target Fare Surveillance Box */}
            {activeRoute && (
              <TargetSurveillanceBox
                route={activeRoute}
                activeCabin={activeCabin}
                onCabinChange={setActiveCabin}
                onUpdateTargetFare={handleUpdateTargetFare}
                onAutoAnchorTarget={handleAutoAnchorTarget}
              />
            )}

            {/* Oracle Panel with Speedometer Dial & 4 Pillars */}
            {activeRoute && <OraclePanel route={activeRoute} activeCabin={activeCabin} />}
          </div>

          {/* Right Column: Trajectory & Data */}
          <div className="right-col" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!activeRoute ? (
              /* Empty State Canvas */
              <div id="empty-state-canvas">
                <h1 id="ui-empty-title">{APP_CONFIG.EMPTY_STATE_TITLE}</h1>
                <p id="ui-empty-subtitle">{APP_CONFIG.EMPTY_STATE_SUBTITLE}</p>
                <button
                  className="primary-btn"
                  id="ui-btn-add-flight-empty"
                  onClick={() => setIsAddFlightModalOpen(true)}
                >
                  {APP_CONFIG.BTN_ADD_FLIGHT_EMPTY}
                </button>
              </div>
            ) : (
              /* Active Dashboard Canvas */
              <div id="active-dashboard-canvas" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <PriceChart
                  route={activeRoute}
                  selectedCabin={activeCabin}
                  onSelectCabin={setActiveCabin}
                />

                <div className="details-wrapper">
                  <ItineraryDetails route={activeRoute} />
                  <HistoryLog logs={activeRoute.historyLog} />
                </div>

                <div className="action-btn-row">
                  <button
                    className="secondary-btn"
                    id="ui-btn-book-search"
                    style={{ background: 'var(--success)', color: 'var(--bg-base)' }}
                    onClick={() => setIsFlightRouterModalOpen(true)}
                  >
                    {APP_CONFIG.BTN_BOOK_SEARCH}
                  </button>
                  <button
                    className="secondary-btn"
                    id="ui-btn-export-csv"
                    onClick={handleExportCSV}
                  >
                    {APP_CONFIG.BTN_EXPORT_CSV}
                  </button>
                  <button
                    className="secondary-btn"
                    id="ui-btn-untrack"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    onClick={() => setIsUntrackModalOpen(true)}
                  >
                    {APP_CONFIG.BTN_UNTRACK}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        currentFetches={apiFetches}
        maxFetches={APP_CONFIG.MAXIMUM_FREE_TIER_MONTHLY_CALLS}
        isShieldEnabled={isShieldEnabled}
        lockThreshold={lockThreshold}
        onSave={handleSaveSettings}
        onOpenOverride={() => setIsFetchOverrideModalOpen(true)}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <FetchOverrideModal
        isOpen={isFetchOverrideModalOpen}
        currentFetches={apiFetches}
        onUpdate={handleUpdateFetches}
        onClose={() => setIsFetchOverrideModalOpen(false)}
      />

      <ManualTrueUpModal
        isOpen={isManualTrueUpModalOpen}
        route={activeRoute}
        currentFetches={apiFetches}
        maxFetches={APP_CONFIG.MAXIMUM_FREE_TIER_MONTHLY_CALLS}
        lockThreshold={lockThreshold}
        onExecuteSweep={handleExecuteLiveSweep}
        onLogManualFare={handleLogManualFare}
        onClose={() => setIsManualTrueUpModalOpen(false)}
      />

      <UntrackConfirmModal
        isOpen={isUntrackModalOpen}
        onConfirm={handleUntrackRoute}
        onClose={() => setIsUntrackModalOpen(false)}
      />

      <ValidationErrorModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
      />

      <FlightRouterModal
        isOpen={isFlightRouterModalOpen}
        route={activeRoute}
        onFireRouterStub={handleFireRouterStub}
        onClose={() => setIsFlightRouterModalOpen(false)}
      />

      <AddFlightModal
        isOpen={isAddFlightModalOpen}
        onAddRoute={handleAddRoute}
        onValidationError={() => setIsValidationModalOpen(true)}
        onClose={() => setIsAddFlightModalOpen(false)}
      />
    </>
  );
};
