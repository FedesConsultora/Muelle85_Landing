// src/providers/UIProviders.jsx
import { ToastProvider } from '../context/ToastContext';
import { ModalProvider } from '../context/ModalContext';

export default function UIProviders({ children }) {
  return (
    <ToastProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ToastProvider>
  );
}
