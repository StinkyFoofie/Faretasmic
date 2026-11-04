import React, { useState } from 'react';
import { Route, VerifiedSpot } from '../../types';

interface ManualTrueUpModalProps {
  isOpen: boolean;
  route: Route | null;
  currentFetches: number;
  maxFetches: number;
  lockThreshold: number;
  onExecuteSweep: () => void;
  onLogManualFare: (spot: {
    fare: number;
    carrier: string;
    leg: 'outbound' | 'return' | 'both';
    note: string;
  }) => void;
  onClose: () => void;
}

export const ManualTrueUpModal: React.FC<ManualTrueUpModalProps> = ({
  isOpen,
  route,
  currentFetches,
  maxFetches,
  lockThreshold,
  onExecuteSweep,
  onLogManualFare,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'sweep'>('manual');

  // Manual Fare state
  const [verifiedFare, setVerifiedFare] = useState<number | ''>(() => {
    return route ? Math.round(route.currentPrice) : 350;
  });
  const [carrierInput, setCarrierInput] = useState<string>(() => {
    return route?.airlines?.[0] ? `${route.airlines[0]} 101` : 'DL 412';
  });
  const [legSelection, setLegSelection] = useState<'outbound' | 'return' | 'both'>('outbound');
  const [observationNotes, setObservationNotes] = useState<string>('');

  if (!isOpen || !route) return null;

  const callsRequired = route.horizon;
  const projectedUsage = currentFetches + callsRequired;
  const isSafe = projectedUsage <= lockThreshold;

  const handleManualSubmit = () => {
    const fareNum = typeof verifiedFare === 'number' ? verifiedFare : parseFloat(verifiedFare);
    if (!fareNum || isNaN(fareNum) || fareNum <= 0) return;

    onLogManualFare({
      fare: fareNum,
      carrier: carrierInput.trim() || 'Verified Carrier',
      leg: legSelection,
      note: observationNotes.trim(),
    });
  };

  return (
    <div className="modal-overlay active" id="modal-true-up" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>⚡ ROUTE TRUE-UP STATION</span>
          <button
            className="secondary-btn"
            style={{
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

        {/* Dual Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderBottom: '1px solid var(--border)',
            padding: '4px',
            gap: '6px',
          }}
        >
          <button
            type="button"
            className={activeTab === 'manual' ? 'primary-btn' : 'secondary-btn'}
            style={{
              flex: 1,
              height: '36px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
            }}
            onClick={() => setActiveTab('manual')}
          >
            ✍️ Manual Fare Log (0 Calls)
          </button>
          <button
            type="button"
            className={activeTab === 'sweep' ? 'primary-btn' : 'secondary-btn'}
            style={{
              flex: 1,
              height: '36px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
            }}
            onClick={() => setActiveTab('sweep')}
          >
            🌐 Ignav API Sweep
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'manual' ? (
            /* Tab 1: Manual Fare Log */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Log verified fares observed directly on an airline portal or Google Flights to anchor your Oracle baseline with zero API usage.
              </p>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>VERIFIED FARE ({route.currency})</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={verifiedFare}
                    onChange={(e) => setVerifiedFare(parseFloat(e.target.value) || '')}
                    placeholder="e.g. 389"
                    style={{ fontWeight: 'bold', fontSize: '16px' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>CARRIER / FLIGHT #</label>
                  <input
                    type="text"
                    className="form-control"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    placeholder="e.g. DL 412"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>APPLY OBSERVATION TO LEG:</label>
                <div
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    marginTop: '4px',
                    fontSize: '13px',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textTransform: 'none' }}>
                    <input
                      type="radio"
                      name="trueup-leg"
                      value="outbound"
                      checked={legSelection === 'outbound'}
                      onChange={() => setLegSelection('outbound')}
                    />{' '}
                    Outbound Anchor
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textTransform: 'none' }}>
                    <input
                      type="radio"
                      name="trueup-leg"
                      value="return"
                      checked={legSelection === 'return'}
                      onChange={() => setLegSelection('return')}
                    />{' '}
                    Return Anchor
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textTransform: 'none' }}>
                    <input
                      type="radio"
                      name="trueup-leg"
                      value="both"
                      checked={legSelection === 'both'}
                      onChange={() => setLegSelection('both')}
                    />{' '}
                    Both Legs
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>OBSERVATION NOTES (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={observationNotes}
                  onChange={(e) => setObservationNotes(e.target.value)}
                  placeholder="e.g. Google Flights flash deal, includes carry-on, Main Cabin"
                />
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '10px',
                  borderLeft: '4px solid var(--success)',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  lineHeight: 1.4,
                }}
              >
                🟢 <strong>ZERO API IMPACT:</strong> Anchors observed price directly into the timeline, updates the Oracle gauge, and pins your observation note to the itinerary.
              </div>
            </div>
          ) : (
            /* Tab 2: Ignav Live API Sweep */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.5 }}>
                Executing this automated sweep will query live pricing across the full {route.horizon}-day horizon and overwrite interpolated points.
              </p>
              <ul
                style={{
                  fontSize: '14px',
                  lineHeight: 1.8,
                  marginLeft: '20px',
                  color: 'var(--text-muted)',
                }}
              >
                <li>
                  Calls Required:{' '}
                  <strong style={{ color: 'var(--text-main)' }}>{callsRequired}</strong>
                </li>
                <li>
                  Current Usage: <strong>{currentFetches} / {maxFetches.toLocaleString()}</strong>
                </li>
                <li>
                  Projected Usage: <strong>{projectedUsage}</strong>
                </li>
              </ul>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '10px',
                  borderLeft: isSafe ? '4px solid var(--success)' : '4px solid var(--danger)',
                  fontSize: '13px',
                  marginTop: '10px',
                }}
              >
                {isSafe ? (
                  '🟢 SAFE: This execution will not breach your lock threshold.'
                ) : (
                  '🔴 CAUTION: This execution will breach your configured shield lockout threshold!'
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            CANCEL
          </button>
          {activeTab === 'manual' ? (
            <button className="primary-btn" onClick={handleManualSubmit}>
              📌 Log Verified Fare
            </button>
          ) : (
            <button className="primary-btn" onClick={onExecuteSweep}>
              EXECUTE LIVE SWEEP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
