import React from 'react';
import { Route } from '../../types';
import { AIRLINE_GROUPS } from '../../config';

interface FlightRouterModalProps {
  isOpen: boolean;
  route: Route | null;
  onFireRouterStub: (targetName: string) => void;
  onClose: () => void;
}

export const FlightRouterModal: React.FC<FlightRouterModalProps> = ({
  isOpen,
  route,
  onFireRouterStub,
  onClose,
}) => {
  if (!isOpen || !route) return null;

  const d1 = route.depDate
    ? new Date(route.depDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'TBD';

  const d2 = route.retDate
    ? new Date(route.retDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const typeStr = route.tripType === 'one-way' ? 'One-Way' : 'Round-Trip';
  const cabStr = route.cabin
    ? route.cabin.charAt(0).toUpperCase() + route.cabin.slice(1)
    : 'Economy';

  const summary = `${route.origin} ➔ ${route.dest} | ${typeStr} | ${d1} - ${d2} | ${route.pax} PAX | ${cabStr}`;

  return (
    <div className="modal-overlay active" id="modal-flight-router" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>✈️ FLIGHT SEARCH ROUTER</span>
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
        <div className="modal-body">
          <div className="form-group">
            <label>ITINERARY SUMMARY</label>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--text-main)',
                marginTop: '5px',
                padding: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
              id="ui-router-summary"
            >
              {summary}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>MONITORED AIRLINES (Direct Search)</label>
            <div id="container-router-airlines">
              {route.airlines && route.airlines.length > 0 ? (
                route.airlines.map((code) => {
                  let nameStr = code;
                  for (const r in AIRLINE_GROUPS) {
                    const match = AIRLINE_GROUPS[r].find((a) => a.code === code);
                    if (match) {
                      nameStr = match.name;
                      break;
                    }
                  }

                  return (
                    <div
                      key={code}
                      className="router-card"
                      onClick={() => onFireRouterStub(nameStr)}
                    >
                      <div>
                        <div className="router-card-title">🛫 {nameStr}</div>
                      </div>
                      <span style={{ fontSize: '18px' }}>➔</span>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    padding: '5px',
                  }}
                >
                  No specific carriers pinned. Defaulting to Google Flights.
                </div>
              )}
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: '1px solid var(--border)',
              margin: '10px 0',
            }}
          />

          <div className="form-group">
            <label>GOOGLE FLIGHTS SEARCH</label>
            <div
              className="router-card"
              onClick={() => onFireRouterStub('Google Flights')}
              style={{ marginTop: '8px', borderColor: 'var(--accent)' }}
            >
              <div>
                <div className="router-card-title">🌐 Search All on Google Flights</div>
                <div className="router-card-sub">
                  Compare all available carriers (Zero API Cost)
                </div>
              </div>
              <span style={{ fontSize: '18px' }}>➔</span>
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="secondary-btn" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
