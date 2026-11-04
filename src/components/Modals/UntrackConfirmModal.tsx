import React from 'react';

interface UntrackConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const UntrackConfirmModal: React.FC<UntrackConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="modal-confirm-untrack" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '400px', borderColor: 'var(--danger)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ color: 'var(--danger)' }}>
          <span>⚠️ CONFIRM UNTRACK</span>
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
            Are you sure you want to untrack this route? All historical pricing data,
            trajectory records, and linked Firestore documents will be permanently purged.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            CANCEL
          </button>
          <button
            className="primary-btn"
            style={{ background: 'var(--danger)' }}
            onClick={onConfirm}
          >
            PERMANENTLY UNTRACK
          </button>
        </div>
      </div>
    </div>
  );
};
