import React from 'react';
import { Route } from '../types';

interface ItineraryDetailsProps {
  route: Route;
}

const TIME_OF_DAY_LABELS: Record<string, string> = {
  anytime: 'Anytime',
  morning: 'Morning (06:00 - 12:00)',
  afternoon: 'Afternoon (12:00 - 18:00)',
  evening: 'Evening / Redeye (18:00+)',
};

export const ItineraryDetails: React.FC<ItineraryDetailsProps> = ({ route }) => {
  const d1 = route.depDate
    ? new Date(route.depDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const d2 = route.retDate
    ? new Date(route.retDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const isOneWay = route.tripType === 'one-way';
  const isOpenJaw = route.tripType === 'open-jaw' || (route.returnOrigin && route.returnOrigin !== route.dest);

  const typeStr = isOneWay
    ? 'One-Way'
    : isOpenJaw
    ? 'Open-Jaw'
    : 'Round-Trip';

  const cabStr = route.cabin
    ? route.cabin.charAt(0).toUpperCase() + route.cabin.slice(1)
    : 'Economy';

  let filterLabel = 'Nonstop Only';
  if (route.stopFilter === '1stop') filterLabel = 'Max 1 Stop';
  if (route.stopFilter === 'any') filterLabel = 'Any Stops';

  let carrierBadges = 'Any';
  if (route.airlines && route.airlines.length > 0) {
    carrierBadges = route.airlines.map((c) => `[${c}]`).join(' ');
  }

  // Handle return leg endpoints (supporting standard or open-jaw)
  const returnOrigin = route.returnOrigin || route.dest;
  const returnDest = route.returnDest || route.origin;

  const timeLabel = route.timeOfDay ? TIME_OF_DAY_LABELS[route.timeOfDay] || 'Anytime' : 'Anytime';

  return (
    <div className="panel details-panel-75">
      <div className="panel-title">Selected Itinerary Details</div>
      <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '8px' }} id="ui-itinerary-details">
        <div className="itinerary-grid">
          {/* Column 1: Routing & Dates */}
          <div className="itinerary-col">
            <div className="itinerary-tag">
              🏷️ <strong>{route.tag}</strong> ({typeStr})
            </div>
            <div>
              🛫 <strong>Outbound:</strong> {route.origin} ➔ {route.dest} ({d1})
            </div>
            {!isOneWay && (
              <div>
                {isOpenJaw ? '🔀' : '🛬'} <strong>Return:</strong> {returnOrigin} ➔ {returnDest} ({d2})
              </div>
            )}
            <div>
              🛑 <strong>Fare Filter:</strong> {filterLabel}
            </div>
          </div>

          {/* Column 2: Cabin, Carry-on & Time Window */}
          <div className="itinerary-col">
            <div>
              👤 <strong>Passengers:</strong> {route.pax} PAX • {cabStr}
            </div>
            <div>
              {route.excludeBasicEconomy ? (
                <span>
                  🧳 <strong style={{ color: 'var(--success)' }}>Carry-On Included</strong> (No Basic Econ)
                </span>
              ) : (
                <span>
                  🧳 <strong>Basic Economy:</strong> Permitted
                </span>
              )}
            </div>
            <div>
              ⏰ <strong>Departure:</strong> {timeLabel}
            </div>
            <div className="itinerary-carriers">
              ✈️ <strong>Carriers:</strong> {carrierBadges}
            </div>
          </div>

          {/* Column 3: Horizon & Tracking Engine */}
          <div className="itinerary-col">
            <div>
              ⏱️ <strong>Tracking:</strong> {route.trackingDuration} Days ({route.currency})
            </div>
            <div>
              🔭 <strong>Genesis Sweep:</strong> {route.horizon}-Day Model
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Vectors: Pre: {route.preBuffer || 0}d | Core: {route.coreSpan || 14}d | Post:{' '}
              {route.postBuffer || 0}d
            </div>
          </div>
        </div>

        {/* Observation Note Banner */}
        {route.latestNote && (
          <div
            className="itinerary-note-banner"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '11px',
              color: 'var(--text-main)',
              lineHeight: 1.3,
            }}
          >
            <span style={{ fontSize: '14px' }}>📝</span>
            <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: 'var(--accent)' }}>LATEST OBSERVATION:</strong> {route.latestNote}
            </div>
          </div>
        )}

        {/* Trip Notes Banner if saved */}
        {route.notes && (
          <div
            className="itinerary-trip-notes"
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'var(--bg-input)',
              padding: '5px 10px',
              borderRadius: 'var(--radius)',
              borderLeft: '3px solid var(--accent)',
            }}
          >
            📌 <strong>TRIP NOTES:</strong> {route.notes}
          </div>
        )}
      </div>
    </div>
  );
};
