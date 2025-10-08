// src/context/ToastContext.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import ToastViewport from '../components/ui/ToastViewport';

const ToastContext = createContext(null);

let _id = 0;
const nextId = () => (++_id).toString();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    ({ title, description = '', type = 'info', duration = 3000 } = {}) => {
      const id = nextId();
      const toast = { id, title, description, type, duration, createdAt: Date.now() };
      setToasts((curr) => [toast, ...curr]);

      if (duration && duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  const value = useMemo(
    () => ({ addToast, dismiss, clearToasts }),
    [addToast, dismiss, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
