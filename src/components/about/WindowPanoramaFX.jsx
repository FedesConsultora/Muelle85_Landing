import { useEffect, useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapContext';
import { gsap, ScrollTrigger } from '../../lib/gsap/setupGsap';

/**
 * Sección fullscreen con pin + scrubbing del video.
 * - Prepara múltiples <source> (WebM + MP4) y sigue funcionando aunque la metadata tarde.
 * - holdTop/holdEnd controlan “póster un toque” al principio y descanso al final.
 * - El copy aparece a los `timeForText` segundos del video.
 */
export default function WindowPanoramaFX({
  pin = true,
  scrub = 0.6,
  endFactor = 2.0,              // duración ≈ múltiplos de viewport
  triggerStart = 'top top',     // cuando el top de la sección toca el top
  timeForText = 3.5,
  holdTop = 0.02,               // dejarlo bien corto para “arrancar enseguida”
  holdEnd = 0.12,
  poster = '/img/transicion-ventana-poster.webp',

  // NUEVO: preferí pasar sources (sino usa webm/mp4 como compat)
  sources = [],
  webm = '/video/transicion-ventana_3_optimizado.webm',
  mp4  = '/video/transicion-ventana_3_optimizado.mp4',
}) {
  const { ref, ctx } = useGsapContext();
  const videoRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const video = videoRef.current;
    if (!el || !video) return;

    // aseguremos flags iOS
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.removeAttribute('controls');

    let duration = 0;
    let armed = false; // evitamos armar dos veces ST
    let warmed = false;

    const content  = el.querySelector('[data-win="content"]');
    const zoomWrap = el.querySelector('[data-win="zoom"]');

    // estado inicial
    gsap.set(zoomWrap, { scale: 1.12, transformOrigin: '50% 50%' });
    gsap.set(content,   { opacity: 0, y: -40, rotate: -2, filter: 'blur(4px)' });

    const textTl = gsap.timeline({ paused: true })
      .to(content, {
        opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)',
        duration: 0.42, ease: 'power1.out'
      });

    const clamp01 = (x) => Math.max(0, Math.min(1, x));

    const armScrollTrigger = () => {
      if (armed) return;
      armed = true;

      ctx.current.add(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: triggerStart,
            end: () => `+=${Math.round(window.innerHeight * endFactor)}`,
            scrub,
            pin,
            pinSpacing: true,
            pinReparent: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // markers: true,
            onUpdate: self => {
              if (!duration) return; // si aún no hay metadata, esperamos
              const p = clamp01(self.progress);
              const activeRange = Math.max(0.0001, 1 - holdTop - holdEnd);
              const activeP = clamp01((p - holdTop) / activeRange);

              // Scrub:
              const t = activeP * duration;
              if (!Number.isNaN(t)) {
                if ('fastSeek' in video && typeof video.fastSeek === 'function') {
                  try { video.fastSeek(t); } catch { video.currentTime = t; }
                } else {
                  video.currentTime = t;
                }
              }

              // Zoom-out en 30% inicial del tramo activo
              const z = clamp01((p - holdTop) / (0.30 * activeRange));
              gsap.to(zoomWrap, {
                scale: gsap.utils.interpolate(1.12, 1, z),
                duration: 0, overwrite: 'auto'
              });

              // Texto a partir de timeForText
              const pStart = duration ? timeForText / duration : 0;
              const span   = 0.25;
              const rel    = clamp01((activeP - pStart) / span);
              textTl.progress(rel);
            }
          }
        })
        // timeline vacío para establecer el pin
        .to({}, { duration: 1 });

        ScrollTrigger.refresh();
      });
    };

    const primeDecoder = async () => {
      if (warmed) return;
      warmed = true;
      try { await video.play(); video.pause(); } catch {}
    };

    const onMeta = () => {
      duration = video.duration || 0;
      if (!duration && video.seekable && video.seekable.length > 0) {
        try { duration = video.seekable.end(0) || 0; } catch {}
      }
      // posicionarse al inicio “activo”
      const startT = clamp01(holdTop) * duration;
      try {
        if ('fastSeek' in video) video.fastSeek(startT);
        else video.currentTime = startT;
      } catch { video.currentTime = startT; }

      primeDecoder();
      armScrollTrigger();
    };

    const onLoadedMeta = () => onMeta();
    const onDuration = () => onMeta();
    const onCanPlay = () => primeDecoder();

    // Armamos ST aun sin metadata, para que el pin funcione ya.
    armScrollTrigger();

    // Cuando entra a viewport por primera vez, forzamos load() (iOS)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        try { video.load(); } catch {}
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);

    // eventos de media
    video.addEventListener('loadedmetadata', onLoadedMeta);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('canplay', onCanPlay);

    // si ya está lista la metadata
    if (video.readyState >= 1) onMeta();

    return () => {
      io.disconnect();
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [pin, scrub, endFactor, triggerStart, timeForText, holdTop, holdEnd]);

  const srcList = (sources && sources.length)
    ? sources
    : [
        { src: webm, type: 'video/webm' },
        { src: mp4,  type: 'video/mp4'  },
      ];

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
          controls={false}
          controlsList="nodownload nofullscreen noplaybackrate"
          disablePictureInPicture
        >
          {srcList.map((s, i) => (
            <source key={i} src={s.src} type={s.type} />
          ))}
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