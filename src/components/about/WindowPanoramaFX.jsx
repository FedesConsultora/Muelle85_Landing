import { useEffect, useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapContext';
import { gsap, ScrollTrigger } from '../../lib/gsap/setupGsap';

/**
 * Pantalla completa. Pin + scrubbing inmediato al ocupar la pantalla.
 * - holdTop mínimo para que el póster se vea pero arranque enseguida.
 * - holdEnd mantiene un “descanso” al final antes de soltar el pin.
 * - El copy cae a los timeForText segundos del video.
 */
export default function WindowPanoramaFX({
  pin = true,
  scrub = 0.6,
  endFactor = 2.0,          // ~2 viewports
  triggerStart = 'top top', // pinea cuando top toca top
  timeForText = 3.5,
  holdTop = 0.04,           // ⬅️ de 0.22 → 0.04 para empezar enseguida
  holdEnd = 0.12,
  poster = '/img/transicion-ventana-poster.webp',
  webm = '/video/transicion-ventana_3_optimizado.webm',
  mp4  = '/video/transicion-ventana_3_optimizado.mp4',
}) {
  const { ref, ctx } = useGsapContext();
  const videoRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const video = videoRef.current;
    if (!el || !video) return;

    let duration = 0;

    const onMeta = () => {
      duration = video.duration || 0;

      ctx.current.add(() => {
        const content  = el.querySelector('[data-win="content"]');
        const zoomWrap = el.querySelector('[data-win="zoom"]');

        // Estado inicial
        gsap.set(zoomWrap, { scale: 1.12, transformOrigin: '50% 50%' });
        gsap.set(content,   { opacity: 0, y: -40, rotate: -2, filter: 'blur(4px)' });

        const textTl = gsap.timeline({ paused: true })
          .to(content, {
            opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)',
            duration: 0.38, ease: 'power1.out'
          });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: triggerStart,
            end: () => `+=${Math.round(window.innerHeight * endFactor)}`,
            scrub,
            pin,
            pinSpacing: true,
            anticipatePin: 1,
            // markers: true,
            onUpdate: self => {
              if (!duration) return;

              // Progreso global [0..1]
              const p = gsap.utils.clamp(0, 1, self.progress);

              // Rango activo (scrub real) después del “póster”
              const activeRange = Math.max(0.0001, 1 - holdTop - holdEnd);
              const activeP = gsap.utils.clamp(0, 1, (p - holdTop) / activeRange);

              // 1) scrubbing del video (inmediato tras ocupar pantalla)
              const t = activeP * duration;
              if (!Number.isNaN(t)) video.currentTime = t;

              // 2) zoom-out en el primer 30% del tramo activo
              const z = gsap.utils.clamp(0, 1, (p - holdTop) / (0.30 * activeRange));
              gsap.to(zoomWrap, { scale: gsap.utils.interpolate(1.12, 1, z), duration: 0, overwrite: 'auto' });

              // 3) copy “cae” a partir de timeForText
              const pStart = duration ? timeForText / duration : 0.0; // 0..1 relativo
              const span   = 0.25; // 25% del timeline para el texto
              const rel    = gsap.utils.clamp(0, 1, (activeP - pStart) / span);
              textTl.progress(rel);
            }
          }
        });

        // timeline vacío (establece pin)
        tl.to({}, { duration: 1 });
        ScrollTrigger.refresh();
      });
    };

    if (video.readyState >= 1) onMeta();
    else video.addEventListener('loadedmetadata', onMeta, { once: true });

    return () => {};
  }, [pin, scrub, endFactor, triggerStart, timeForText, holdTop, holdEnd]);

  return (
    <section ref={ref} className="windowFx" aria-label="Ventana panorámica">
      <div className="windowFx__media" data-win="zoom">
        <video
          ref={videoRef}
          className="windowFx__video"
          poster={poster}
          playsInline
          muted
          preload="auto"
        >
          <source src={webm} type="video/webm" />
          <source src={mp4}  type="video/mp4" />
        </video>
        <div className="windowFx__tint" aria-hidden="true" />
        <div className="windowFx__grad" aria-hidden="true" />
      </div>

      <div className="windowFx__content container" data-win="content">
        <span className="eyebrow">Aliados de la naturaleza</span>
        <h2>Sostenibilidad combativa</h2>
        <p>
          En un mundo invadido por plásticos, tomamos una postura. Reemplazamos todo lo posible por madera y hierro,
          logrando que apenas el 3 % del equipo sea plástico. Por cada tráiler que fabricamos, plantamos tres árboles,
          triplicando el recurso que utilizamos.
        </p>
      </div>
    </section>
  );
}
