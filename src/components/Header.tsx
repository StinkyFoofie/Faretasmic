import React from 'react';
import { APP_CONFIG } from '../config';

interface HeaderProps {
  apiFetches: number;
  maxFetches: number;
  isShieldEnabled: boolean;
  lockThreshold: number;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
  onShuffleQA: () => void;
  hasActiveRoute: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiFetches,
  maxFetches,
  isShieldEnabled,
  lockThreshold,
  onOpenTheme,
  onOpenSettings,
  onShuffleQA,
  hasActiveRoute,
}) => {
  const pct = ((apiFetches / maxFetches) * 100).toFixed(1);

  let gateSub = 'SHIELDS AT THE READY';
  let gateIcon = '🟢';
  let gateColor = 'var(--text-muted)';

  if (!isShieldEnabled) {
    gateSub = 'SHIELDS DOWN';
    gateColor = 'var(--danger)';
    gateIcon = '🔴';
  } else if (apiFetches >= lockThreshold) {
    gateSub = 'SHIELDS BLOCKING';
    gateColor = 'var(--danger)';
    gateIcon = '🔴';
  } else if (parseFloat(pct) > 80) {
    gateSub = 'WARNING (>80%)';
    gateColor = 'var(--warning)';
    gateIcon = '🟡';
  } else {
    gateSub = 'SHIELDS AT THE READY';
    gateColor = 'var(--text-muted)';
    gateIcon = '🟢';
  }

  return (
    <header className="header-tray">
      <div className="header-brand">
        <h2 id="ui-app-title">{APP_CONFIG.APP_TITLE}</h2>
        <span id="ui-app-version" className="app-version">
          {APP_CONFIG.APP_VERSION}
        </span>
      </div>

      <div className="telemetry-tray">
        {/* 1. API */}
        <div className="telemetry-item">
          <div className="telemetry-indicator" id="ui-icon-api">🟢</div>
          <div className="telemetry-text-group">
            <div className="telemetry-label" id="ui-lbl-api">API: Ready</div>
            <div className="telemetry-sub" id="ui-sub-api">
              {apiFetches}/{maxFetches} Calls ({pct}%)
            </div>
          </div>
        </div>

        {/* 2. Gate */}
        <div className="telemetry-item">
          <div className="telemetry-indicator" id="ui-icon-gate">{gateIcon}</div>
          <div className="telemetry-text-group">
            <div className="telemetry-label">🛡️ Fetch Shield</div>
            <div className="telemetry-sub" id="ui-sub-gate" style={{ color: gateColor }}>
              {gateSub}
            </div>
          </div>
        </div>

        {/* 3. DB */}
        <div className="telemetry-item">
          <div className="telemetry-indicator" id="ui-icon-db">🟢</div>
          <div className="telemetry-text-group">
            <div className="telemetry-label">Database</div>
            <div className="telemetry-sub" id="ui-sub-db">Synced</div>
          </div>
        </div>

        {/* 4. Sync */}
        <div className="telemetry-item">
          <div className="telemetry-indicator">⏱️</div>
          <div className="telemetry-text-group">
            <div className="telemetry-label">Last Sync</div>
            <div className="telemetry-sub">Daily 02:00 UTC</div>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {APP_CONFIG.ENABLE_DEV_DATA_SHUFFLE && (
          <button
            className="secondary-btn btn-icon"
            id="ui-btn-shuffle"
            onClick={onShuffleQA}
            title={APP_CONFIG.TOOLTIP_BTN_SHUFFLE_QA}
            disabled={!hasActiveRoute}
            style={{ display: 'flex' }}
          >
            {APP_CONFIG.EMOJI_BTN_SHUFFLE_QA}
          </button>
        )}
        <button
          className="secondary-btn btn-icon"
          id="ui-btn-theme"
          onClick={onOpenTheme}
          title={APP_CONFIG.TOOLTIP_BTN_THEME}
        >
          {APP_CONFIG.EMOJI_BTN_THEME}
        </button>
        <button
          className="secondary-btn btn-icon"
          id="ui-btn-settings"
          onClick={onOpenSettings}
          title={APP_CONFIG.TOOLTIP_BTN_SETTINGS}
        >
          {APP_CONFIG.EMOJI_BTN_SETTINGS}
        </button>
      </div>
    </header>
  );
};
