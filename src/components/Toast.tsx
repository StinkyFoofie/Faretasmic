import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div id="toast-container" className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`theme-toast ${toast.collapsing ? 'magic-collapsing' : ''}`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
};
