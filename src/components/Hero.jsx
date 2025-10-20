import { useEffect, useRef } from 'react';

export default function Hero() {
  const vRef = useRef(null);

  useEffect(() => {
    const v = vRef.current;
    if (!v) return;

    // asegurar flags compatibles con iOS
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      // evita que aparezca UI de “play”
      v.removeAttribute('controls');
      // algunas versiones requieren pausa+play para enganchar
      try { v.play().catch(() => {}); } catch {}
    };

    // empujoncitos
    const onCanPlay = () => tryPlay();
    const onGesture = () => { tryPlay(); window.removeEventListener('pointerdown', onGesture); window.removeEventListener('touchstart', onGesture); };
    const onVis = () => { if (!document.hidden) tryPlay(); };

    v.addEventListener('canplay', onCanPlay);
    window.addEventListener('pointerdown', onGesture, { once: true });
    window.addEventListener('touchstart', onGesture, { once: true, passive: true });
    document.addEventListener('visibilitychange', onVis);

    // primer intento
    tryPlay();

    return () => {
      v.removeEventListener('canplay', onCanPlay);
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('touchstart', onGesture);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <section id="hero" className="hero" aria-label="Hero principal">
      <div id="top" className="hero__media">
        <video
          ref={vRef}
          className="hero__video"
          // si tenés MP4, podés cambiar a <source> múltiple; WebM va rápido en Chrome
          src="/video/hero_optimizado.webm"
          poster="/img/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          // pequeños hints para no mostrar botonería
          controls={false}
          controlsList="nodownload nofullscreen noplaybackrate"
          disablePictureInPicture
        />
        <div className="hero__tint" aria-hidden="true" />
        <div className="hero__gradient" aria-hidden="true" />
      </div>

      <div className="hero__content container">
        <span className="eyebrow">Terra Trailers</span>
        <h1>
          No es para los que viajan.<br />
          Es para los que <strong>VIVEN</strong>.
        </h1>
        <button className="buttonViaje">
          <p>Obtén tu viaje de prueba</p>
        </button>
      </div>
    </section>
  );
}