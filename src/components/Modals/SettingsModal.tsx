import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  currentFetches: number;
  maxFetches: number;
  isShieldEnabled: boolean;
  lockThreshold: number;
  onSave: (threshold: number, shieldEnabled: boolean) => void;
  onOpenOverride: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentFetches,
  maxFetches,
  isShieldEnabled: initialShieldEnabled,
  lockThreshold: initialLockThreshold,
  onSave,
  onOpenOverride,
  onClose,
}) => {
  const [shieldEnabled, setShieldEnabled] = useState(initialShieldEnabled);
  const [threshold, setThreshold] = useState(initialLockThreshold);

  useEffect(() => {
    setShieldEnabled(initialShieldEnabled);
    setThreshold(initialLockThreshold);
  }, [initialShieldEnabled, initialLockThreshold, isOpen]);

  if (!isOpen) return null;

  const rem = maxFetches - currentFetches;
  let statusText = `🟢 SHIELDS AT THE READY (${rem} calls remaining)`;
  let statusColor = 'var(--success)';

  if (!shieldEnabled) {
    statusText = '🔴 SHIELDS DOWN (Shield Disabled)';
    statusColor = 'var(--danger)';
  } else if (currentFetches >= threshold) {
    statusText = '🔴 SHIELDS BLOCKING (0 calls remaining)';
    statusColor = 'var(--danger)';
  } else if ((currentFetches / maxFetches) * 100 > 80) {
    statusText = `🟡 WARNING (${rem} calls remaining)`;
    statusColor = 'var(--warning)';
  }

  return (
    <div className="modal-overlay active" id="modal-settings" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <span style={{ flex: 1, textAlign: 'center' }}>⚙️ SETTINGS</span>
          <button
            className="secondary-btn"
            style={{
              position: 'absolute',
              right: '15px',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>IGNAV USAGE TELEMETRY</label>
            <div style={{ paddingLeft: '14px', marginTop: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
                  Current Window:
                </span>{' '}
                Oct 01 - Oct 31, 2026
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '5px',
                }}
              >
                <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    Ignav Fetches:
                  </span>{' '}
                  <span id="ui-settings-fetch-count">{currentFetches}</span> / {maxFetches}
                </div>
                <button
                  className="secondary-btn"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={onOpenOverride}
                >
                  EDIT
                </button>
              </div>

              <div
                style={{
                  marginTop: '15px',
                  padding: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  Capacity Budget Assumptions
                </div>
                <ul
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    marginLeft: '20px',
                    color: 'var(--text-main)',
                  }}
                >
                  <li>
                    <strong style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
                      Genesis Baseline Sweep:
                    </strong>{' '}
                    14 initial calls
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
                      Daily Surveillance:
                    </strong>{' '}
                    2 calls / day (1 Outbound + 1 Return)
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
                      Tracking Window:
                    </strong>{' '}
                    30 consecutive days (~74 calls / route)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

          <div className="form-group">
            <label>FAIL-SAFE HARD LOCK</label>
            <div style={{ paddingLeft: '14px', marginTop: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                  textTransform: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={shieldEnabled}
                  onChange={(e) => setShieldEnabled(e.target.checked)}
                />{' '}
                Enable Fetch Shield
              </label>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                Safety tripwire: Automatically halts scheduled fetches when the threshold is hit.
              </div>
              <div
                className="form-row"
                style={{ marginTop: '12px', alignItems: 'center' }}
              >
                <input
                  type="number"
                  className="form-control"
                  id="input-lock-threshold"
                  min="1"
                  max="9999"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                  style={{ maxWidth: '90px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Calls Threshold
                </span>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: statusColor,
                  marginTop: '12px',
                }}
                id="ui-settings-shield-status"
              >
                {statusText}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="secondary-btn" onClick={onClose}>
            CLOSE
          </button>
          <button
            className="primary-btn"
            onClick={() => onSave(threshold, shieldEnabled)}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};
