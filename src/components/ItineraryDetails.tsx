import React from 'react';
import { Route } from '../types';

interface ItineraryDetailsProps {
  route: Route;
}

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

  const typeStr = route.tripType === 'one-way' ? 'One-Way' : 'Round-Trip';
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

  return (
    <div className="panel details-panel-75">
      <div className="panel-title">Selected Itinerary Details</div>
      <div style={{ marginTop: '2px' }} id="ui-itinerary-details">
        <div className="itinerary-grid">
          <div className="itinerary-col">
            <div className="itinerary-tag">
              🏷️ <strong>{route.tag}</strong> ({typeStr})
            </div>
            <div>
              🛫 <strong>Outbound:</strong> {route.origin} ➔ {route.dest} ({d1})
            </div>
            <div>
              🛬 <strong>Return:</strong> {route.dest} ➔ {route.origin} ({d2})
            </div>
          </div>
          <div className="itinerary-col">
            <div>
              👤 <strong>Passengers:</strong> {route.pax} PAX • {cabStr}
            </div>
            <div>
              🛑 <strong>Fare Filter:</strong> {filterLabel}
            </div>
            <div className="itinerary-carriers">
              ✈️ <strong>Carriers:</strong> {carrierBadges}
            </div>
          </div>
          <div className="itinerary-col">
            <div>
              ⏱️️ <strong>Tracking:</strong> {route.trackingDuration} Days ({route.currency})
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
      </div>
    </div>
  );
};
