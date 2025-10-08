// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import UIProviders from './providers/UIProviders';
import './styles/main.scss';

createRoot(document.getElementById('root')).render(
  <UIProviders>
    <App />
  </UIProviders>
);
