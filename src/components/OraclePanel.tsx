import React from 'react';
import { Route, CabinClass } from '../types';
import { generateCabinSpecificTrajectory } from '../engine/aeroflux';

interface OraclePanelProps {
  route: Route;
  activeCabin?: CabinClass;
}

export const OraclePanel: React.FC<OraclePanelProps> = ({ route, activeCabin = 'economy' }) => {
  const effectiveDataPoints = generateCabinSpecificTrajectory(route, activeCabin);
  const effectiveCurrentPrice = effectiveDataPoints[0] || route.currentPrice;

  const maxVal = Math.max(...effectiveDataPoints);
  const minVal = Math.min(...effectiveDataPoints);
  const cHigh = Math.ceil(maxVal * 1.10);
  const cLow = Math.floor(minVal * 0.90);
  const cMid = Math.round((cHigh + cLow) / 2);
  const cRange = Math.max(1, cHigh - cLow);

  // Standard deviation calculation
  const n = effectiveDataPoints.length;
  const mean = effectiveDataPoints.reduce((acc, v) => acc + v, 0) / (n || 1);
  const variance = effectiveDataPoints.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n || 1);
  const stdDev = Math.sqrt(variance);

  // Pillar 1: Standard-deviation confidence score
  const devRatio = Math.abs(effectiveCurrentPrice - mean) / Math.max(1, stdDev);
  const windowBonus = route.horizon >= 30 ? 6 : 3;
  const rawConfidence = Math.round(52 + (devRatio * 18) + windowBonus);
  const confidenceScore = Math.min(96, Math.max(68, rawConfidence));

  // Drop vs Mid
  const drop = Math.round(((cMid - effectiveCurrentPrice) / cMid) * 100);
  const isBuy = effectiveCurrentPrice < cMid;

  // Spectrum gauge needle percentage
  let percent = ((effectiveCurrentPrice - cLow) / cRange) * 100;
  if (percent < 5) percent = 5;
  if (percent > 95) percent = 95;

  // Target fare on spectrum gauge
  const targetFare = route.targetFares?.[activeCabin];
  let percentTarget: number | null = null;
  if (targetFare !== undefined) {
    let tPct = ((targetFare - cLow) / cRange) * 100;
    if (tPct < 3) tPct = 3;
    if (tPct > 97) tPct = 97;
    percentTarget = tPct;
  }

  // Pillar 2: Action-By Walk-Up Deadline countdown (depDate - 14 days)
  let actionByDateLabel = 'Within 14 Days';
  let actionByCountdown = '14d buffer';
  let isActionUrgent = false;

  if (route.depDate) {
    const dep = new Date(route.depDate);
    const actionBy = new Date(dep);
    actionBy.setDate(actionBy.getDate() - 14);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((actionBy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    actionByDateLabel = actionBy.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (diffDays <= 0) {
      actionByCountdown = 'CRITICAL: Walk-up surge active';
      isActionUrgent = true;
    } else if (diffDays <= 5) {
      actionByCountdown = `⚠️ ${diffDays}d left before walk-up surge`;
      isActionUrgent = true;
    } else {
      actionByCountdown = `${diffDays}d left before walk-up surge`;
    }
  }

  // Pillar 3: Outbound vs Return split leg bias
  const outboundAnchor = effectiveDataPoints[0] ?? 0;
  const returnAnchor = effectiveDataPoints[route.horizon - 1] ?? 0;
  const splitDiff = outboundAnchor - returnAnchor;
  let splitBiasLabel = 'Balanced Split';
  if (splitDiff > 15) {
    splitBiasLabel = `Outbound Heavy (+$${Math.abs(splitDiff)} vs return)`;
  } else if (splitDiff < -15) {
    splitBiasLabel = `Return Heavy (+$${Math.abs(splitDiff)} vs outbound)`;
  } else {
    splitBiasLabel = `Balanced (~$${outboundAnchor}/leg)`;
  }

  // Pillar 4: Target delta
  let targetDeltaLabel = 'Target: Not Set';
  let isTargetHit = false;
  if (targetFare !== undefined) {
    const delta = effectiveCurrentPrice - targetFare;
    if (delta <= 0) {
      targetDeltaLabel = `🎯 TARGET REACHED (-$${Math.abs(delta)} ${route.currency})`;
      isTargetHit = true;
    } else {
      targetDeltaLabel = `+$${delta} ${route.currency} above target`;
    }
  }

  // Speedometer Needle Math: Theta = (Confidence * 1.8) - 90 deg (from -90 to +90 deg)
  const needleAngle = (confidenceScore * 1.8) - 90;

  // Confidence Range Coloring (Inverted per spec: 0-50% Red, 51-75% Yellow, 76-100% Green)
  let rangeColor = 'var(--danger)';
  let pillTextColor = '#ffffff';
  if (confidenceScore >= 76) {
    rangeColor = 'var(--success)';
    pillTextColor = '#ffffff';
  } else if (confidenceScore >= 51) {
    rangeColor = 'var(--warning)';
    pillTextColor = '#18181b'; // Proposal 3: Dark text on amber for WCAG AA contrast
  } else {
    rangeColor = 'var(--danger)';
    pillTextColor = '#ffffff';
  }

  // Geometry for animated percentage label on the outer perimeter:
  // Center is at (105, 95). Outer perimeter radius for badge = 88.
  const cx = 105;
  const cy = 95;
  const outerR = 88;
  const rad = (needleAngle * Math.PI) / 180;
  const labelX = cx + outerR * Math.sin(rad);
  const labelY = cy - outerR * Math.cos(rad);

  return (
    <div className="panel" id="panel-oracle" style={{ display: 'flex' }}>
      <div className="panel-title" style={{ textAlign: 'center' }}>
        🔮 BRUNOPHESY
      </div>

      {/* Speedometer Confidence Dial SVG with Animated Orbiting Percentage */}
      <div
        className="speedometer-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '2px 0 6px 0',
        }}
      >
        <div style={{ position: 'relative', width: '210px', height: '115px' }}>
          <svg width="210" height="115" viewBox="0 0 210 115">
            <defs>
              <linearGradient id="gaugeArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--danger)" />
                <stop offset="50%" stopColor="var(--warning)" />
                <stop offset="100%" stopColor="var(--success)" />
              </linearGradient>
            </defs>

            {/* Gauge Background Track (Semi-circle radius 68 from 37,95 to 173,95) */}
            <path
              d="M 37 95 A 68 68 0 0 1 173 95"
              fill="none"
              stroke="var(--bg-input)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Zone 1: Low Confidence / High Volatility (0% to 50% - Red) */}
            <path
              d="M 37 95 A 68 68 0 0 1 105 27"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="8"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
            {/* Zone 2: Moderate Conviction (51% to 75% - Yellow/Amber) */}
            <path
              d="M 105 27 A 68 68 0 0 1 153 47"
              fill="none"
              stroke="var(--warning)"
              strokeWidth="8"
              strokeOpacity="0.85"
            />
            {/* Zone 3: High Conviction (76% to 100% - Green) */}
            <path
              d="M 153 47 A 68 68 0 0 1 173 95"
              fill="none"
              stroke="var(--success)"
              strokeWidth="8"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />

            {/* Scale Tick Marks */}
            <circle cx="37" cy="95" r="2" fill="var(--text-muted)" />
            <circle cx="105" cy="27" r="2" fill="var(--text-muted)" />
            <circle cx="153" cy="47" r="2" fill="var(--text-muted)" />
            <circle cx="173" cy="95" r="2" fill="var(--text-muted)" />

            {/* Dynamic Needle Pointing Outwards */}
            <g
              transform={`translate(${cx}, ${cy}) rotate(${needleAngle})`}
              style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <polygon
                points="0,-66 -3,-10 3,-10"
                fill={rangeColor}
                filter="drop-shadow(0 0 4px rgba(0,0,0,0.5))"
              />
              <circle cx="0" cy="0" r="5" fill={rangeColor} />
              <circle cx="0" cy="0" r="2" fill="var(--text-inverse)" />
            </g>

            {/* Animated Percentage Badge on Outer Perimeter (Dynamically matches range color) */}
            <g
              transform={`translate(${labelX}, ${labelY})`}
              style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <rect
                x="-19"
                y="-10"
                width="38"
                height="20"
                rx="10"
                fill={rangeColor}
                stroke={rangeColor}
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 5px rgba(0,0,0,0.4))"
              />
              <text
                x="0"
                y="0.5"
                textAnchor="middle"
                dominantBaseline="central"
                fill={pillTextColor}
                fontSize="11"
                fontWeight="900"
                fontFamily="var(--font-heading)"
              >
                {confidenceScore}%
              </text>
            </g>
          </svg>

          {/* Centered Sub-Label in Hub Base */}
          <div
            style={{
              position: 'absolute',
              bottom: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              lineHeight: 1,
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              CONFIDENCE INDEX
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Badge */}
      <div
        id="badge-oracle-recommendation-status"
        className={`status-badge ${isBuy ? 'status-buy' : 'status-hold'}`}
      >
        {isBuy
          ? `📉 BUY NOW: -${drop}% vs ${route.horizon}d BASELINE (${confidenceScore}% Conviction)`
          : `🟡 HOLD: PRICES ELEVATED (${confidenceScore}% Conviction)`}
      </div>

      {/* Historical Price Spectrum Gauge with Target Marker */}
      <div
        style={{
          marginTop: '6px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontWeight: 'bold',
          textAlign: 'center',
          letterSpacing: '0.3px',
        }}
      >
        HISTORICAL PRICE GAUGE ({route.horizon}-DAY SET)
      </div>
      <div
        className="gauge-container"
        id="container-price-spectrum-gauge"
        style={{ position: 'relative' }}
      >
        <div className="gauge-segment gauge-low" id="ui-gauge-low-bounds">
          ${cLow}
        </div>
        <div className="gauge-segment gauge-typ">TYPICAL</div>
        <div className="gauge-segment gauge-hi" id="ui-gauge-hi-bounds">
          ${cHigh}
        </div>

        {/* Current Price Marker */}
        <div
          className="gauge-marker"
          id="ui-gauge-needle"
          style={{ left: `${percent}%` }}
          title={`Current Price: $${effectiveCurrentPrice}`}
        />

        {/* Target Fare Pin Marker (Exact line design matching needle + centered 🎯 emoji) */}
        {percentTarget !== null && (
          <div
            className="gauge-target-marker"
            id="ui-gauge-target-pin"
            style={{
              position: 'absolute',
              left: `${percentTarget}%`,
              top: '-5px',
              width: '3px',
              height: '48px',
              background: 'var(--warning)',
              boxShadow: '0 0 8px var(--warning)',
              transform: 'translateX(-50%)',
              zIndex: 4,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'auto',
              transition: 'left 0.3s ease',
            }}
            title={`Target Budget: $${targetFare} (${activeCabin})`}
          >
            <span
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '14px',
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              🎯
            </span>
          </div>
        )}
      </div>

      {/* 4 Pillars Analytics Grid */}
      <div
        className="oracle-pillars-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginTop: '6px',
          fontSize: '11px',
        }}
      >
        {/* Pillar 1: Conviction & Volatility */}
        <div
          style={{
            background: 'var(--bg-input)',
            padding: '7px 9px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>
            🎯 Conviction Tier
          </div>
          <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px' }}>
            {confidenceScore >= 85 ? 'High Precision' : 'Moderate Volatility'} (σ ±${Math.round(stdDev)})
          </div>
        </div>

        {/* Pillar 2: Action-By Deadline */}
        <div
          style={{
            background: 'var(--bg-input)',
            padding: '7px 9px',
            borderRadius: 'var(--radius)',
            border: `1px solid ${isActionUrgent ? 'var(--warning)' : 'var(--border)'}`,
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>
            ⏳ Action-By Date
          </div>
          <div
            style={{
              fontWeight: 'bold',
              color: isActionUrgent ? 'var(--warning)' : 'var(--text-main)',
              marginTop: '2px',
            }}
          >
            {actionByDateLabel}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            {actionByCountdown}
          </div>
        </div>

        {/* Pillar 3: Split Leg Bias */}
        <div
          style={{
            background: 'var(--bg-input)',
            padding: '7px 9px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>
            ⚖️ Leg Split Bias
          </div>
          <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px' }}>
            {splitBiasLabel}
          </div>
        </div>

        {/* Pillar 4: Target Delta */}
        <div
          style={{
            background: 'var(--bg-input)',
            padding: '7px 9px',
            borderRadius: 'var(--radius)',
            border: `1px solid ${isTargetHit ? 'var(--success)' : 'var(--border)'}`,
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>
            🎯 Budget Delta
          </div>
          <div
            style={{
              fontWeight: 'bold',
              color: isTargetHit ? 'var(--success)' : 'var(--text-main)',
              marginTop: '2px',
            }}
          >
            {targetDeltaLabel}
          </div>
        </div>
      </div>

      {/* Outbound & Return Anchors */}
      <div className="oracle-anchors-container" style={{ marginTop: '8px', fontSize: '11px' }}>
        <div>
          Outbound Anchor:{' '}
          <strong style={{ color: 'var(--text-main)' }}>${outboundAnchor}</strong> (
          <span className="ui-currency-label">{route.currency}</span>) • Return Anchor:{' '}
          <strong style={{ color: 'var(--text-main)' }}>${returnAnchor}</strong> (
          <span className="ui-currency-label">{route.currency}</span>)
        </div>
      </div>
    </div>
  );
};
