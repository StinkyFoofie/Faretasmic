import React, { useState, useEffect } from 'react';

interface FetchOverrideModalProps {
  isOpen: boolean;
  currentFetches: number;
  onUpdate: (newCount: number) => void;
  onClose: () => void;
}

export const FetchOverrideModal: React.FC<FetchOverrideModalProps> = ({
  isOpen,
  currentFetches,
  onUpdate,
  onClose,
}) => {
  const [val, setVal] = useState(currentFetches);

  useEffect(() => {
    setVal(currentFetches);
  }, [currentFetches, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="modal-fetch-override" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>📊 OVERRIDE FETCH COUNT</span>
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
        <div className="modal-body" style={{ alignItems: 'center', gap: '20px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Enter verified billing cycle usage:
          </label>
          <input
            type="number"
            className="form-control"
            id="input-override-fetches"
            min="0"
            max="9999"
            value={val}
            onChange={(e) => setVal(parseInt(e.target.value) || 0)}
            style={{
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              height: '50px',
            }}
          />
        </div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            CANCEL
          </button>
          <button
            className="primary-btn"
            onClick={() => onUpdate(val)}
          >
            UPDATE USAGE
          </button>
        </div>
      </div>
    </div>
  );
};
