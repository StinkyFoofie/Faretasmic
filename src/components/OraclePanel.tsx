import React from 'react';
import { Route } from '../types';

interface OraclePanelProps {
  route: Route;
}

export const OraclePanel: React.FC<OraclePanelProps> = ({ route }) => {
  const maxVal = Math.max(...route.dataPoints);
  const minVal = Math.min(...route.dataPoints);
  const cHigh = Math.ceil(maxVal * 1.10);
  const cLow = Math.floor(minVal * 0.90);
  const cMid = Math.round((cHigh + cLow) / 2);
  const cRange = Math.max(1, cHigh - cLow);

  const drop = Math.round(((cMid - route.currentPrice) / cMid) * 100);
  const isBuy = route.currentPrice < cMid;

  let percent = ((route.currentPrice - cLow) / cRange) * 100;
  if (percent < 5) percent = 5;
  if (percent > 95) percent = 95;

  const outboundAnchor = route.dataPoints[0]?.toFixed(2) ?? '0.00';
  const returnAnchor = route.dataPoints[route.horizon - 1]?.toFixed(2) ?? '0.00';

  return (
    <div className="panel" id="panel-oracle" style={{ display: 'flex' }}>
      <div className="panel-title" style={{ textAlign: 'center' }}>
        Predictive Oracle Engine
      </div>
      <div
        id="badge-oracle-recommendation-status"
        className={`status-badge ${isBuy ? 'status-buy' : 'status-hold'}`}
      >
        {isBuy
          ? `📉 BUY NOW: -${drop}% vs ${route.horizon} DAY BASELINE`
          : '🟡 HOLD: PRICES ELEVATED'}
      </div>

      <div
        style={{
          marginTop: '7px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        HISTORICAL PRICE GAUGE ({route.horizon}-DAY SET)
      </div>
      <div className="gauge-container" id="container-price-spectrum-gauge">
        <div className="gauge-segment gauge-low" id="ui-gauge-low-bounds">
          ${cLow}
        </div>
        <div className="gauge-segment gauge-typ">TYPICAL</div>
        <div className="gauge-segment gauge-hi" id="ui-gauge-hi-bounds">
          ${cHigh}
        </div>
        <div
          className="gauge-marker"
          id="ui-gauge-needle"
          style={{ left: `${percent}%` }}
        />
      </div>

      <div
        style={{
          marginTop: '7px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        Anchors
      </div>
      <div className="oracle-anchors-container">
        <div>
          Outbound Anchor:{' '}
          <strong style={{ color: 'var(--text-main)' }}>
            ${outboundAnchor}
          </strong>{' '}
          (<span className="ui-currency-label">{route.currency}</span>)
        </div>
        <div>
          Return Anchor:{' '}
          <strong style={{ color: 'var(--text-main)' }}>
            ${returnAnchor}
          </strong>{' '}
          (<span className="ui-currency-label">{route.currency}</span>)
        </div>
      </div>
    </div>
  );
};
