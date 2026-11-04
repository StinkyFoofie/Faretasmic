import React from 'react';
import { Route } from '../../types';

interface ManualTrueUpModalProps {
  isOpen: boolean;
  route: Route | null;
  currentFetches: number;
  maxFetches: number;
  lockThreshold: number;
  onExecute: () => void;
  onClose: () => void;
}

export const ManualTrueUpModal: React.FC<ManualTrueUpModalProps> = ({
  isOpen,
  route,
  currentFetches,
  maxFetches,
  lockThreshold,
  onExecute,
  onClose,
}) => {
  if (!isOpen || !route) return null;

  const callsRequired = route.horizon;
  const projectedUsage = currentFetches + callsRequired;
  const isSafe = projectedUsage <= lockThreshold;

  return (
    <div className="modal-overlay active" id="modal-true-up" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>⚠️ MANUAL HORIZON TRUE-UP</span>
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
          <p style={{ fontSize: '14px', lineHeight: 1.5 }}>
            Executing this manual sweep will overwrite the current elastically interpolated
            data with live Ignav API pricing.
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
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            CANCEL
          </button>
          <button className="primary-btn" onClick={onExecute}>
            EXECUTE TRUE-UP
          </button>
        </div>
      </div>
    </div>
  );
};
