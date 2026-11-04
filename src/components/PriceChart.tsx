import React, { useState } from 'react';
import { Route, ChartFormat } from '../types';

interface PriceChartProps {
  route: Route;
}

export const PriceChart: React.FC<PriceChartProps> = ({ route }) => {
  const [chartFormat, setChartFormat] = useState<ChartFormat>('bar');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const maxVal = Math.max(...route.dataPoints);
  const minVal = Math.min(...route.dataPoints);
  const cHigh = Math.ceil(maxVal * 1.10);
  const cLow = Math.floor(minVal * 0.90);
  const cMid = Math.round((cHigh + cLow) / 2);
  const cRange = Math.max(1, cHigh - cLow);

  const baseDate = new Date();

  // Pre-calculate line path and points if in line format
  let linePath = '';
  const scatterDots: { x: number; y: number; isAnchor: boolean; index: number }[] = [];

  if (chartFormat === 'line') {
    for (let i = 0; i < route.horizon; i++) {
      const px = route.horizon > 1 ? (i / (route.horizon - 1)) * 100 : 50;
      const py = 100 - (((route.dataPoints[i] - cLow) / cRange) * 100);
      scatterDots.push({
        x: px,
        y: py,
        isAnchor: i === 0 || i === route.horizon - 1,
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

  return (
    <div className="panel panel-chart">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2px',
        }}
      >
        <div className="panel-title" style={{ marginBottom: 0 }}>
          {route.horizon}-DAY PRICE TRAJECTORY
        </div>

        {/* Custom Select: Chart Format */}
        <div
          className={`custom-select ${isSelectOpen ? 'open' : ''}`}
          id="cs-chart-format"
          style={{ width: '140px' }}
        >
          <div
            className="custom-select-trigger"
            style={{ height: '28px', padding: '5px 10px', fontSize: '11px' }}
            onClick={() => setIsSelectOpen(!isSelectOpen)}
          >
            <span className="c-text">
              {chartFormat === 'bar' ? '📊 Bar Graph' : '📈 Line Graph'}
            </span>
            <span className="c-arrow">▼</span>
          </div>

          {isSelectOpen && (
            <div className="custom-select-options" style={{ display: 'block' }}>
              <div
                className={`custom-option ${chartFormat === 'bar' ? 'selected' : ''}`}
                onClick={() => {
                  setChartFormat('bar');
                  setIsSelectOpen(false);
                }}
              >
                📊 Bar Graph
              </div>
              <div
                className={`custom-option ${chartFormat === 'line' ? 'selected' : ''}`}
                onClick={() => {
                  setChartFormat('line');
                  setIsSelectOpen(false);
                }}
              >
                📈 Line Graph
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="y-axis">
          <div className="y-axis-label-vert">
            Price ({route.currency})
          </div>
          <span id="ui-y-axis-high">${cHigh}</span>
          <span id="ui-y-axis-mid">${cMid}</span>
          <span id="ui-y-axis-low">${cLow}</span>
        </div>

        <div className="mock-chart" id="ui-mock-chart-container">
          {chartFormat === 'bar' ? (
            Array.from({ length: route.horizon }).map((_, i) => {
              const isAnchor = i === 0 || i === route.horizon - 1;
              const isMilestone =
                i === 0 ||
                i === Math.floor(route.horizon / 2) ||
                i === route.horizon - 1;
              const heightBase = ((route.dataPoints[i] - cLow) / cRange) * 100;
              const heightPercent = Math.max(2, Math.min(100, heightBase));

              return (
                <div key={i} className="chart-bar-container">
                  <div
                    className={`chart-bar ${isAnchor ? 'anchor' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  />

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
                    strokeWidth="1"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {scatterDots.map((dot) => (
                  <div
                    key={dot.index}
                    className="chart-scatter-dot"
                    style={{
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      backgroundColor: dot.isAnchor
                        ? 'var(--success)'
                        : 'var(--accent)',
                    }}
                  />
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
