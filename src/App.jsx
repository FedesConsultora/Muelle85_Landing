// src/App.jsx (agrega el import y coloca About bajo el Hero)
import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/about/About';   
import Steps from './components/Steps';
import Legion from './components/Legion';
import { registrarSesion } from './services/appscript';
import { getOrCreateSessionId } from './utils/session';
import { captureUTMs, getLandingContext } from './utils/utm';
import Footer from './components/Footer';

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
      <Header />
      <Hero />
      <About />  
      <Legion />
      <Steps />
      <Footer />
    </>
  );
}
