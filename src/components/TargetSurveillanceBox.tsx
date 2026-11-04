import React, { useState, useEffect } from 'react';
import { Route, CabinClass } from '../types';
import { generateCabinSpecificTrajectory } from '../engine/aeroflux';
import { useOutsideClick } from '../hooks/useOutsideClick';

interface TargetSurveillanceBoxProps {
  route: Route;
  activeCabin: CabinClass;
  onCabinChange: (cabin: CabinClass) => void;
  onUpdateTargetFare: (cabin: CabinClass, fare: number | undefined) => void;
  onAutoAnchorTarget: (cabin: CabinClass) => void;
}

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'Economy',
  premium: 'Premium Economy',
  business: 'Business',
  first: 'First',
};

export const TargetSurveillanceBox: React.FC<TargetSurveillanceBoxProps> = ({
  route,
  activeCabin,
  onCabinChange,
  onUpdateTargetFare,
  onAutoAnchorTarget,
}) => {
  const [isCabinSelectOpen, setIsCabinSelectOpen] = useState(false);
  const cabinSelectRef = useOutsideClick<HTMLDivElement>(isCabinSelectOpen, () =>
    setIsCabinSelectOpen(false)
  );

  // Compute effective current price for selected cabin
  const effectivePoints = generateCabinSpecificTrajectory(route, activeCabin);
  const effectiveCurrentPrice = effectivePoints[0] || route.currentPrice;

  const currentTarget = route.targetFares?.[activeCabin];
  const [inputValue, setInputValue] = useState<string>(
    currentTarget !== undefined ? currentTarget.toString() : ''
  );

  // Synchronize input value when active cabin or route.targetFares changes
  useEffect(() => {
    const val = route.targetFares?.[activeCabin];
    setInputValue(val !== undefined ? val.toString() : '');
  }, [activeCabin, route.targetFares]);

  // Commit value only on explicit Enter or blur (no toasts per keystroke!)
  const handleCommit = () => {
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      if (currentTarget !== undefined) {
        onUpdateTargetFare(activeCabin, undefined);
      }
      return;
    }
    const parsed = parseFloat(trimmed);
    if (!isNaN(parsed) && parsed > 0) {
      const rounded = Math.round(parsed);
      if (rounded !== currentTarget) {
        onUpdateTargetFare(activeCabin, rounded);
      }
    } else {
      // Revert if invalid
      setInputValue(currentTarget !== undefined ? currentTarget.toString() : '');
    }
  };

  const delta = currentTarget !== undefined ? effectiveCurrentPrice - currentTarget : null;
  const isTargetMet = delta !== null && delta <= 0;

  return (
    <div className="panel target-surveillance-panel" id="panel-target-surveillance">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
          gap: '8px',
        }}
      >
        <div className="panel-title" style={{ marginBottom: 0 }}>
          🎯 Zurgulate
        </div>
        {currentTarget !== undefined && (
          <span
            className={`target-delta-pill ${isTargetMet ? 'pill-met' : 'pill-active'}`}
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
              background: isTargetMet ? 'var(--success)' : 'var(--warning)',
              color: 'var(--text-inverse)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isTargetMet
              ? `🎯 HIT (-$${Math.abs(delta!)} ${route.currency})`
              : `+$${delta} to Target`}
          </span>
        )}
      </div>

      <div className="form-row" style={{ alignItems: 'center', gap: '8px' }}>
        {/* Cabin Selector */}
        <div
          ref={cabinSelectRef}
          className={`custom-select ${isCabinSelectOpen ? 'open' : ''}`}
          id="cs-target-cabin"
          style={{ flex: '1.2' }}
        >
          <div
            className="custom-select-trigger"
            style={{ height: '34px', fontSize: '12px', padding: '4px 8px' }}
            onClick={() => setIsCabinSelectOpen(!isCabinSelectOpen)}
          >
            <span className="c-text">💺 {CABIN_LABELS[activeCabin]}</span>
            <span className="c-arrow">▼</span>
          </div>
          {isCabinSelectOpen && (
            <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
              {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
                <div
                  key={c}
                  className={`custom-option ${activeCabin === c ? 'selected' : ''}`}
                  onClick={() => {
                    onCabinChange(c);
                    setIsCabinSelectOpen(false);
                  }}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  💺 {CABIN_LABELS[c]}
                  {route.targetFares?.[c] && (
                    <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '6px' }}>
                      (${route.targetFares[c]})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Target Fare Input with Enter-to-Submit */}
        <div style={{ flex: '1', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '8px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            $
          </span>
          <input
            type="number"
            className="form-control"
            id="input-target-fare-val"
            placeholder="Target (↵)"
            title="Type target fare and press Enter ↵ to save"
            min={1}
            max={99999}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommit();
              }
            }}
            onBlur={handleCommit}
            style={{
              height: '34px',
              paddingLeft: '22px',
              paddingRight: '24px',
              fontSize: '13px',
              fontWeight: 'bold',
              borderColor: isTargetMet ? 'var(--success)' : undefined,
              boxShadow: isTargetMet ? '0 0 6px var(--success)' : undefined,
            }}
          />
          <button
            type="button"
            onClick={handleCommit}
            title="Press to save target"
            style={{
              position: 'absolute',
              right: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '2px',
              lineHeight: 1,
            }}
          >
            ↵
          </button>
        </div>
      </div>

      {/* Auto-Anchor Button Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
        <button
          type="button"
          className="secondary-btn"
          id="btn-auto-set-target"
          onClick={() => onAutoAnchorTarget(activeCabin)}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--accent)',
            borderColor: 'var(--border)',
          }}
          title="Anchor target to 25th percentile of historical price trajectory"
        >
          🎯 Auto-Set Target (25th %)
        </button>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Current: <strong style={{ color: 'var(--text-main)' }}>${effectiveCurrentPrice}</strong> {route.currency}
        </span>
      </div>
    </div>
  );
};
