import React, { useState, useEffect } from 'react';
import { Route, ThemeId, ToastMessage } from './types';
import { APP_CONFIG, THEMES_LIST } from './config';
import { Header } from './components/Header';
import { OraclePanel } from './components/OraclePanel';
import { PriceChart } from './components/PriceChart';
import { ItineraryDetails } from './components/ItineraryDetails';
import { HistoryLog } from './components/HistoryLog';
import { Toast } from './components/Toast';

import { ThemeModal } from './components/Modals/ThemeModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ManualTrueUpModal } from './components/Modals/ManualTrueUpModal';
import { FetchOverrideModal } from './components/Modals/FetchOverrideModal';
import { UntrackConfirmModal } from './components/Modals/UntrackConfirmModal';
import { ValidationErrorModal } from './components/Modals/ValidationErrorModal';
import { FlightRouterModal } from './components/Modals/FlightRouterModal';
import { AddFlightModal } from './components/Modals/AddFlightModal';

export const App: React.FC = () => {
  // Theme state
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('app_theme') as ThemeId) || 'modern-dark';
  });

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
    localStorage.setItem('app_theme', activeTheme);
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

  // Monitored routes state
  const [routes, setRoutes] = useState<Route[]>(() => {
    try {
      const saved = localStorage.getItem('faretasmic_routes');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved routes:', e);
    }
    return [];
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('faretasmic_routes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });

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

  const showToast = (text: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, collapsing: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 5000);
  };

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
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || null;

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

  const handleExecuteTrueUp = () => {
    if (activeRoute) {
      setApiFetches((prev) => prev + activeRoute.horizon);
      setIsManualTrueUpModalOpen(false);
      showToast(`⚡ Manual true-up completed: +${activeRoute.horizon} fetches recorded.`);
    }
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
    setIsAddFlightModalOpen(false);
    showToast(`${APP_CONFIG.TOAST_FLIGHT_ADDED} (${newRoute.origin} ➔ ${newRoute.dest})`);
  };

  const handleShuffleQA = () => {
    if (!activeRoute) return;
    const baseCurrent = Math.floor(Math.random() * 200) + 300;
    const dataVals: number[] = [];
    for (let i = 0; i < activeRoute.horizon; i++) {
      const flux = Math.sin(i) * 15 + (Math.random() * 20 - 10);
      dataVals.push(baseCurrent + flux);
    }
    dataVals[0] = baseCurrent;
    dataVals[activeRoute.horizon - 1] = baseCurrent + 45;

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
    const carriers = ['DL', 'AC', 'UA', 'AA', 'JL'];
    const rndCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const rndFlight = Math.floor(Math.random() * 900) + 100;
    const newLogItem = `${todayStr} : ${rndCarrier} ${rndFlight}`;

    const updatedRoutes = routes.map((r) => {
      if (r.id === activeRoute.id) {
        const nextLogs = [newLogItem, ...r.historyLog];
        if (nextLogs.length > 5) nextLogs.pop();
        return {
          ...r,
          currentPrice: baseCurrent,
          dataPoints: dataVals,
          historyLog: nextLogs,
        };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    showToast('🎲 QA Price Shuffle applied.');
  };

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
    ];

    const baseDate = new Date();
    const rows = activeRoute.dataPoints.map((price, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
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

    showToast('📥 EXPORT CSV: Download started');
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
          onShuffleQA={handleShuffleQA}
          hasActiveRoute={!!activeRoute}
        />

        {/* Main Split Architecture */}
        <div className="main-grid">
          {/* Left Column: Controls & Oracle */}
          <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="panel">
              <div className="panel-title" style={{ textAlign: 'center' }}>
                Active Monitors (<span id="ui-monitor-count">{routes.length}</span> /{' '}
                <span id="ui-monitor-max">{maxMonitors}</span>)
              </div>

              {/* Custom Select: Active Monitors */}
              <div
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
                  ⚡ Fetch
                </button>
              </div>
            </div>

            {/* Oracle Panel */}
            {activeRoute && <OraclePanel route={activeRoute} />}
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
                <PriceChart route={activeRoute} />

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
        onExecute={handleExecuteTrueUp}
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
