import React from 'react';

interface AeroFluxHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HolidayEntry {
  emoji: string;
  name: string;
  region: string;
  dateWindow: string;
  surge: string;
  rationale: string;
}

const HOLIDAYS_DATA: HolidayEntry[] = [
  {
    emoji: '🎄',
    name: 'Christmas Peak',
    region: 'Global / All Routes',
    dateWindow: 'Dec 18 – Dec 26',
    surge: '+65%',
    rationale: 'Highest annual passenger volume, minimal seat discounting',
  },
  {
    emoji: '🎆',
    name: "New Year's Rush",
    region: 'Global / All Routes',
    dateWindow: 'Dec 27 – Jan 04',
    surge: '+65%',
    rationale: 'Post-holiday return wave and festival leisure travel',
  },
  {
    emoji: '🦃',
    name: 'Thanksgiving Rush',
    region: 'US Domestic & Cross-Border',
    dateWindow: 'Nov 20 – Nov 30 (4th Thu ±4d)',
    surge: '+55%',
    rationale: 'Steepest US domestic load factors of the fiscal year',
  },
  {
    emoji: '🍂',
    name: 'Canadian Thanksgiving',
    region: 'Canada & Transborder',
    dateWindow: 'Oct 08 – Oct 15 (2nd Mon ±3d)',
    surge: '+32%',
    rationale: 'Major fall long-weekend family migration across Canadian hubs',
  },
  {
    emoji: '🧧',
    name: 'Lunar New Year',
    region: 'Transpacific (Asia-Pacific)',
    dateWindow: 'Jan 22 – Feb 14',
    surge: '+50%',
    rationale: 'Heavy outbound Asia travel, diaspora family reunions',
  },
  {
    emoji: '🌸',
    name: 'Japan Golden Week',
    region: 'Transpacific (NRT/HND/KIX)',
    dateWindow: 'Apr 29 – May 05',
    surge: '+45%',
    rationale: 'Four national holidays grouped together; massive outbound demand',
  },
  {
    emoji: '🏖️',
    name: 'European Summer (Ferragosto)',
    region: 'Transatlantic (Europe)',
    dateWindow: 'Aug 01 – Aug 18',
    surge: '+35%',
    rationale: 'Peak European holiday recess, transatlantic high summer yields',
  },
  {
    emoji: '🍺',
    name: 'Oktoberfest Season',
    region: 'Transatlantic (Europe / MUC)',
    dateWindow: 'Sep 20 – Oct 06',
    surge: '+25%',
    rationale: 'Bavarian autumn festival drawing millions of international visitors',
  },
  {
    emoji: '🎆',
    name: '4th of July Weekend',
    region: 'US Domestic & Cross-Border',
    dateWindow: 'Jul 01 – Jul 07',
    surge: '+35%',
    rationale: 'Mid-summer holiday peak, high domestic leisure travel demand',
  },
  {
    emoji: '🍁',
    name: 'Canada Day Long Weekend',
    region: 'Canada & Transborder',
    dateWindow: 'Jun 29 – Jul 03',
    surge: '+30%',
    rationale: 'National holiday weekend kickstarting Canadian summer vacation season',
  },
  {
    emoji: '🌸',
    name: 'Spring Break & Cherry Blossom',
    region: 'Global / All Routes',
    dateWindow: 'Mar 12 – Mar 28',
    surge: '+25%',
    rationale: 'College/K-12 school breaks and cherry blossom festival surge',
  },
  {
    emoji: '🎃',
    name: 'Halloween Weekend',
    region: 'Global / All Routes',
    dateWindow: 'Oct 27 – Nov 01',
    surge: '+12%',
    rationale: 'Late-autumn weekend getaways and theme-park surges',
  },
  {
    emoji: '⛷️',
    name: 'Winter Ski Peak',
    region: 'Mountain & Transcon Routes',
    dateWindow: 'Feb 10 – Feb 24 (Presidents Day)',
    surge: '+20%',
    rationale: 'Presidents Day weekend and Rocky Mountain winter sports rush',
  },
];

export const AeroFluxHolidaysModal: React.FC<AeroFluxHolidaysModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      id="modal-aeroflux-holidays"
      onClick={onClose}
      style={{ zIndex: 10050 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '92vw', maxWidth: '720px', maxHeight: '85vh' }}
      >
        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <span style={{ flex: 1, textAlign: 'center' }}>
            📅 AEROFLUX CALENDAR SURGE MATRIX
          </span>
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

        <div className="modal-body" style={{ padding: '15px', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            The AeroFlux predictive engine automatically identifies regional calendar spikes
            based on origin, destination, and departure dates, plotting floating emoji pins
            and adjusting baseline price elasticity:
          </div>

          <div
            style={{
              overflowX: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-input)',
              marginTop: '4px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '8px 10px' }}>Event</th>
                  <th style={{ padding: '8px 10px' }}>Region / Tier</th>
                  <th style={{ padding: '8px 10px' }}>Calendar Window</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Surge</th>
                  <th style={{ padding: '8px 10px' }}>Model Rationale</th>
                </tr>
              </thead>
              <tbody>
                {HOLIDAYS_DATA.map((h, i) => (
                  <tr
                    key={h.name}
                    style={{
                      borderBottom:
                        i !== HOLIDAYS_DATA.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '15px', marginRight: '6px' }}>{h.emoji}</span>
                      {h.name}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {h.region}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {h.dateWindow}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span
                        style={{
                          background: 'rgba(255, 68, 68, 0.15)',
                          color: 'var(--danger)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          border: '1px solid var(--danger)',
                        }}
                      >
                        {h.surge}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {h.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="primary-btn" onClick={onClose} style={{ minWidth: '100px' }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
