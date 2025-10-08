// src/context/ModalContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../components/ui/Modal';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const [content, setContent] = useState(null); // React node
  const [title, setTitle] = useState('');
  const [size, setSize] = useState('md'); // sm | md | lg
  const previouslyFocused = useRef(null);

  const openModal = useCallback(({ title = '', content = null, size = 'md' } = {}) => {
    previouslyFocused.current = document.activeElement;
    setTitle(title);
    setContent(content);
    setSize(size);
    setOpen(true);
    document.body.classList.add('no-scroll');
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setContent(null);
    document.body.classList.remove('no-scroll');
    if (previouslyFocused.current && previouslyFocused.current.focus) {
      previouslyFocused.current.focus();
      previouslyFocused.current = null;
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeModal]);

  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal open={isOpen} title={title} size={size} onClose={closeModal}>
        {content}
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal debe usarse dentro de <ModalProvider>');
  return ctx;
}
