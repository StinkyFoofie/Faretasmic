import React, { useState } from 'react';
import { Route, ChartFormat, VerifiedSpot, CabinClass, HolidayEvent } from '../types';
import { detectHolidayWindow, generateCabinSpecificTrajectory } from '../engine/aeroflux';
import { useOutsideClick } from '../hooks/useOutsideClick';

interface PriceChartProps {
  route: Route;
  selectedCabin?: CabinClass;
  onSelectCabin?: (cabin: CabinClass) => void;
}

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'Economy',
  premium: 'Premium Economy',
  business: 'Business',
  first: 'First',
};

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1.0,
  premium: 1.65,
  business: 3.2,
  first: 4.8,
};

export const PriceChart: React.FC<PriceChartProps> = ({
  route,
  selectedCabin = 'economy',
  onSelectCabin,
}) => {
  const [chartFormat, setChartFormat] = useState<ChartFormat>('bar');
  const [isFormatSelectOpen, setIsFormatSelectOpen] = useState(false);
  const [isCabinSelectOpen, setIsCabinSelectOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cabinSelectRef = useOutsideClick<HTMLDivElement>(isCabinSelectOpen, () =>
    setIsCabinSelectOpen(false)
  );
  const formatSelectRef = useOutsideClick<HTMLDivElement>(isFormatSelectOpen, () =>
    setIsFormatSelectOpen(false)
  );

  // Autonomous cabin-specific trajectory modeling
  const effectiveDataPoints = generateCabinSpecificTrajectory(route, selectedCabin);
  const baseCabin = route.cabin || 'economy';
  const multiplier = CABIN_MULTIPLIER[selectedCabin] / CABIN_MULTIPLIER[baseCabin];

  const maxVal = Math.max(...effectiveDataPoints);
  const minVal = Math.min(...effectiveDataPoints);
  const cHigh = Math.ceil(maxVal * 1.10);
  const cLow = Math.floor(minVal * 0.90);
  const cMid = Math.round((cHigh + cLow) / 2);
  const cRange = Math.max(1, cHigh - cLow);

  const baseDate = new Date();

  // Map of verified spots by dayIndex
  const spotMap = new Map<number, VerifiedSpot>();
  if (route.verifiedSpots) {
    route.verifiedSpots.forEach((spot) => {
      spotMap.set(spot.dayIndex, {
        ...spot,
        price: Math.round(spot.price * multiplier),
      });
    });
  }

  // Map of holidays by dayIndex
  const holidayMap = new Map<number, HolidayEvent>();
  for (let i = 0; i < route.horizon; i++) {
    let routeHol: HolidayEvent | null = null;
    if (route.holidayDays && route.holidayDays.length > 0) {
      const item = route.holidayDays[i];
      if (item) {
        if ('holiday' in item) {
          routeHol = (item as { dayIndex: number; holiday: HolidayEvent }).holiday;
        } else {
          routeHol = item as HolidayEvent;
        }
      }
    }

    if (routeHol) {
      holidayMap.set(i, routeHol);
    } else {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const hol = detectHolidayWindow(d, route.origin, route.dest);
      if (hol) holidayMap.set(i, hol);
    }
  }

  // Pre-calculate line path and scatter dots
  let linePath = '';
  const scatterDots: {
    x: number;
    y: number;
    isAnchor: boolean;
    isVerifiedSpot: boolean;
    holiday?: HolidayEvent;
    index: number;
  }[] = [];

  if (chartFormat === 'line') {
    for (let i = 0; i < route.horizon; i++) {
      const px = route.horizon > 1 ? (i / (route.horizon - 1)) * 100 : 50;
      const py = 100 - (((effectiveDataPoints[i] - cLow) / cRange) * 100);
      scatterDots.push({
        x: px,
        y: py,
        isAnchor: i === 0 || i === route.horizon - 1,
        isVerifiedSpot: spotMap.has(i),
        holiday: holidayMap.get(i),
        index: i,
      });
      linePath += `${i === 0 ? 'M' : 'L'} ${px} ${py} `;
    }
  }

  const getDateLabel = (offsetDays: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  };

  // Active target fare calculation for dashed line
  const activeTarget = route.targetFares?.[selectedCabin];
  let targetLineY: number | null = null;
  if (activeTarget !== undefined) {
    const rawY = 100 - (((activeTarget - cLow) / cRange) * 100);
    targetLineY = Math.max(0, Math.min(100, rawY));
  }

  const activeHoveredSpot = hoveredIndex !== null ? spotMap.get(hoveredIndex) : null;
  const activeHoveredHoliday = hoveredIndex !== null ? holidayMap.get(hoveredIndex) : null;

  return (
    <div className="panel panel-chart">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '2px',
        }}
      >
        <div className="panel-title" style={{ marginBottom: 0 }}>
          {route.horizon}-Day TIKIMETRY
        </div>

        {/* Control Cluster: Cabin Quick-Switcher + Format Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Cabin Dropdown */}
          <div
            ref={cabinSelectRef}
            className={`custom-select ${isCabinSelectOpen ? 'open' : ''}`}
            id="cs-chart-cabin-switcher"
            style={{ width: '142px' }}
          >
            <div
              className="custom-select-trigger custom-select-trigger-centered"
              style={{ height: '28px', fontSize: '11px' }}
              onClick={() => {
                setIsCabinSelectOpen(!isCabinSelectOpen);
                setIsFormatSelectOpen(false);
              }}
            >
              <span className="c-text">💺 {CABIN_LABELS[selectedCabin]}</span>
              <span className="c-arrow">▼</span>
            </div>

            {isCabinSelectOpen && (
              <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
                {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
                  <div
                    key={c}
                    className={`custom-option ${selectedCabin === c ? 'selected' : ''}`}
                    onClick={() => {
                      if (onSelectCabin) onSelectCabin(c);
                      setIsCabinSelectOpen(false);
                    }}
                    style={{ fontSize: '11px', padding: '6px 8px' }}
                  >
                    💺 {CABIN_LABELS[c]}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Select: Chart Format */}
          <div
            ref={formatSelectRef}
            className={`custom-select ${isFormatSelectOpen ? 'open' : ''}`}
            id="cs-chart-format"
            style={{ width: '125px' }}
          >
            <div
              className="custom-select-trigger custom-select-trigger-centered"
              style={{ height: '28px', fontSize: '11px' }}
              onClick={() => {
                setIsFormatSelectOpen(!isFormatSelectOpen);
                setIsCabinSelectOpen(false);
              }}
            >
              <span className="c-text">
                {chartFormat === 'bar' ? '📊 Bar Graph' : '📈 Line Graph'}
              </span>
              <span className="c-arrow">▼</span>
            </div>

            {isFormatSelectOpen && (
              <div className="custom-select-options" style={{ display: 'block', zIndex: 100 }}>
                <div
                  className={`custom-option ${chartFormat === 'bar' ? 'selected' : ''}`}
                  onClick={() => {
                    setChartFormat('bar');
                    setIsFormatSelectOpen(false);
                  }}
                  style={{ fontSize: '11px', padding: '6px 8px' }}
                >
                  📊 Bar Graph
                </div>
                <div
                  className={`custom-option ${chartFormat === 'line' ? 'selected' : ''}`}
                  onClick={() => {
                    setChartFormat('line');
                    setIsFormatSelectOpen(false);
                  }}
                  style={{ fontSize: '11px', padding: '6px 8px' }}
                >
                  📈 Line Graph
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chart-wrapper" style={{ position: 'relative' }}>
        {/* Floating Precision Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="chart-tooltip"
            style={{
              position: 'absolute',
              top: '-34px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-surface)',
              border: activeHoveredSpot
                ? '2px solid var(--warning)'
                : activeHoveredHoliday
                ? '2px solid var(--accent)'
                : '1px solid var(--border-focus)',
              boxShadow: 'var(--shadow)',
              padding: '4px 10px',
              borderRadius: 'var(--radius)',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'var(--text-main)',
              zIndex: 10,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>
              Day {hoveredIndex + 1} ({getDateLabel(hoveredIndex)}):{' '}
              <strong style={{ color: activeHoveredSpot ? 'var(--warning)' : 'var(--accent)' }}>
                ${effectiveDataPoints[hoveredIndex]?.toFixed(2)}
              </strong>{' '}
              ({route.currency})
            </span>
            {activeHoveredHoliday && (
              <span
                style={{
                  background: 'var(--bg-badge)',
                  color: 'var(--text-badge)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  border: '1px solid var(--border-hover)',
                }}
              >
                {activeHoveredHoliday.emoji} {activeHoveredHoliday.name}
              </span>
            )}
            {activeHoveredSpot && (
              <span
                style={{
                  background: 'var(--warning)',
                  color: 'var(--text-inverse)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: '9px',
                }}
              >
                📌 {activeHoveredSpot.carrier || 'Verified Spot'}
              </span>
            )}
          </div>
        )}

        <div className="y-axis">
          <div className="y-axis-label-vert">
            Price ({route.currency})
          </div>
          <span id="ui-y-axis-high">${cHigh}</span>
          <span id="ui-y-axis-mid">${cMid}</span>
          <span id="ui-y-axis-low">${cLow}</span>
        </div>

        <div className="mock-chart" id="ui-mock-chart-container" style={{ position: 'relative' }}>
          {/* Dashed Horizontal Target Fare Line */}
          {targetLineY !== null && (
            <div
              className="chart-target-line"
              style={{
                position: 'absolute',
                top: `${targetLineY}%`,
                left: '0',
                right: '0',
                height: '0',
                borderTop: '2px dashed var(--warning)',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              <div
                className="chart-target-badge"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '-10px',
                  background: 'var(--warning)',
                  color: 'var(--text-inverse)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '9px',
                  fontWeight: '900',
                  letterSpacing: '0.3px',
                  boxShadow: '0 0 6px var(--warning)',
                  pointerEvents: 'none',
                }}
              >
                🎯 Target: ${activeTarget}
              </div>
            </div>
          )}

          {chartFormat === 'bar' ? (
            Array.from({ length: route.horizon }).map((_, i) => {
              const isAnchor = i === 0 || i === route.horizon - 1;
              const isVerifiedSpot = spotMap.has(i);
              const holiday = holidayMap.get(i);
              const isMilestone =
                i === 0 ||
                i === Math.floor(route.horizon / 2) ||
                i === route.horizon - 1;
              const heightBase = ((effectiveDataPoints[i] - cLow) / cRange) * 100;
              const heightPercent = Math.max(2, Math.min(100, heightBase));

              return (
                <div
                  key={i}
                  className="chart-bar-container"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={`chart-bar ${isAnchor ? 'anchor' : ''} ${
                      isVerifiedSpot ? 'verified-spot' : ''
                    }`}
                    style={{
                      height: `${heightPercent}%`,
                      border: isVerifiedSpot ? '2px solid var(--warning)' : undefined,
                      boxShadow: isVerifiedSpot ? '0 0 8px var(--warning)' : undefined,
                      opacity: hoveredIndex === i ? 1 : undefined,
                      position: 'relative',
                    }}
                  >
                    {/* Floating Holiday Emoji Pin */}
                    {holiday && (
                      <span
                        className="holiday-chart-pin"
                        title={`${holiday.emoji} ${holiday.name}`}
                        style={{
                          position: 'absolute',
                          top: isVerifiedSpot ? '-28px' : '-16px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                        }}
                      >
                        {holiday.emoji}
                      </span>
                    )}

                    {/* Verified Spot Pin */}
                    {isVerifiedSpot && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-16px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '11px',
                        }}
                      >
                        📌
                      </span>
                    )}
                  </div>

                  {isMilestone && (
                    <div className="x-axis-label">
                      <span className="date">{getDateLabel(i)}</span>
                      Day {i + 1}
                    </div>
                  )}

                  {isAnchor && (
                    <div className="anchor-label-block">
                      {i === 0 ? 'Outbound' : 'Return'}
                      <br />
                      Anchor
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <>
              <div className="chart-svg-layer">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d={linePath}
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {scatterDots.map((dot) => (
                  <React.Fragment key={dot.index}>
                    {/* Holiday Emoji Pin in Line Mode */}
                    {dot.holiday && (
                      <span
                        className="holiday-chart-pin"
                        title={`${dot.holiday.emoji} ${dot.holiday.name}`}
                        style={{
                          position: 'absolute',
                          left: `${dot.x}%`,
                          top: `calc(${dot.y}% - 14px)`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: '11px',
                          pointerEvents: 'none',
                          zIndex: 5,
                        }}
                      >
                        {dot.holiday.emoji}
                      </span>
                    )}

                    <div
                      className={`chart-scatter-dot ${
                        dot.isVerifiedSpot ? 'verified-spot' : ''
                      }`}
                      style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        backgroundColor: dot.isVerifiedSpot
                          ? 'var(--warning)'
                          : dot.isAnchor
                          ? 'var(--success)'
                          : 'var(--accent)',
                        border: dot.isVerifiedSpot ? '2px solid var(--text-main)' : undefined,
                        boxShadow: dot.isVerifiedSpot ? '0 0 8px var(--warning)' : undefined,
                        transform:
                          hoveredIndex === dot.index
                            ? 'translate(-50%, -50%) scale(1.6)'
                            : 'translate(-50%, -50%)',
                        transition: 'transform 0.15s ease',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                      }}
                      onMouseEnter={() => setHoveredIndex(dot.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </React.Fragment>
                ))}
              </div>

              {Array.from({ length: route.horizon }).map((_, i) => {
                const isMilestone =
                  i === 0 ||
                  i === Math.floor(route.horizon / 2) ||
                  i === route.horizon - 1;
                const isAnchor = i === 0 || i === route.horizon - 1;
                if (!isMilestone) return null;

                const px =
                  route.horizon > 1
                    ? (i / (route.horizon - 1)) * 100
                    : 50;

                return (
                  <div
                    key={i}
                    className="chart-bar-container"
                    style={{
                      position: 'absolute',
                      left: `${px}%`,
                      bottom: '0',
                      width: '0',
                    }}
                  >
                    <div className="x-axis-label">
                      <span className="date">{getDateLabel(i)}</span>
                      Day {i + 1}
                    </div>

                    {isAnchor && (
                      <div className="anchor-label-block">
                        {i === 0 ? 'Outbound' : 'Return'}
                        <br />
                        Anchor
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
