// src/components/ui/Modal.jsx
import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

function ensurePortalRoot() {
  let root = document.getElementById('portal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'portal-root';
    document.body.appendChild(root);
  }
  return root;
}

export default function Modal({ open, title, size = 'md', onClose, children }) {
  const portal = useMemo(() => ensurePortalRoot(), []);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      // focus primer foco disponible
      const focusable = dialogRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }
  }, [open]);

  if (!open) return null;

  const onOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div className="ui-modal__overlay" onMouseDown={onOverlay}>
      <div
        className={`ui-modal size-${size}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        <header className="ui-modal__header">
          <h3 className="ui-modal__title">{title}</h3>
          <button className="ui-modal__close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        <div className="ui-modal__content">{children}</div>
      </div>
    </div>,
    portal
  );
}
