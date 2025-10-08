// src/components/ui/ToastViewport.jsx
import React, { useEffect, useMemo } from 'react';
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

export default function ToastViewport({ toasts, onDismiss }) {
  const portal = useMemo(() => ensurePortalRoot(), []);

  useEffect(() => {
    // aria-live para lectores de pantalla
    if (portal) portal.setAttribute('aria-live', 'polite');
  }, [portal]);

  const content = (
    <div className="ui-toast-viewport">
      {toasts.map(t => (
        <div key={t.id} className={`ui-toast is-${t.type}`} role="status">
          <div className="ui-toast__body">
            <div className="ui-toast__title">{t.title}</div>
            {t.description ? <div className="ui-toast__desc">{t.description}</div> : null}
          </div>
          <button className="ui-toast__close" onClick={() => onDismiss(t.id)} aria-label="Cerrar notificación">×</button>
        </div>
      ))}
    </div>
  );

  return createPortal(content, portal);
}
