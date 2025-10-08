// src/App.jsx
import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Gamas from './components/Gamas';
import { registrarSesion } from './services/appscript';
import { getOrCreateSessionId } from './utils/session';
import { captureUTMs, getLandingContext } from './utils/utm';

export default function App() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const utms = captureUTMs();
    const ctx  = getLandingContext();
    registrarSesion({
      id_sesion: sessionId,
      fecha_visita: new Date().toLocaleString('es-AR'),
      ...ctx, ...utms
    }).catch(() => {});
  }, []);

  return (
    <>
      <Header id="top" />
      <Hero />
      <Gamas />
      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} Muelle85</div>
      </footer>
    </>
  );
}