import React from 'react';
import { THEMES_LIST } from '../../config';
import { ThemeId } from '../../types';

interface ThemeModalProps {
  isOpen: boolean;
  activeTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId | 'random') => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  activeTheme,
  onSelectTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" id="modal-theme" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <span style={{ flex: 1, textAlign: 'center' }}>🎨 SELECT THEME</span>
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
        <div className="modal-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
            id="theme-grid"
          >
            {THEMES_LIST.map((theme) => {
              const isActive = !theme.isRandom && activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  className={`${theme.isRandom ? 'primary-btn' : 'secondary-btn'} ${
                    isActive ? 'theme-active' : ''
                  }`}
                  data-theme-id={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                >
                  {theme.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
