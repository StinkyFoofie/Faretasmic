import React from 'react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="modal-validation-error" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '400px', borderColor: 'var(--warning)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ color: 'var(--warning)' }}>
          <span>⚠️ INVALID ITINERARY</span>
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
        <div className="modal-body" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          Please correct the following errors before tracking:
          <ul style={{ marginLeft: '20px', marginTop: '10px', color: 'var(--text-muted)' }}>
            <li>Origin and Destination must be valid 3-letter IATAs.</li>
            <li>Departure date cannot be in the past.</li>
            <li>Return date must be after departure date.</li>
          </ul>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="primary-btn" onClick={onClose}>
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
