import { useEffect, useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapContext';
import { gsap, ScrollTrigger } from '../../lib/gsap/setupGsap';

/**
 * Scrub de video con GSAP + ScrollTrigger (mobile/desktop).
 * - Acepta múltiples sources (webm/mp4) para compatibilidad iOS.
 * - range: [0..1] sobre la duración del video.
 */
export default function ScrollScrubVideoFX({
  sources = [],             // [{src, type}]
  poster = '',
  className = '',
  range = [0, 1],           // fracción [inicio, fin]
  minHeightMobile = '36vh',
  fit = 'cover',
  aspect = '1',
  ariaLabel = 'Vídeo controlado por scroll',
  // tuning
  start = 'top bottom',     // arranca cuando entra a vista por abajo
  end   = 'bottom top',     // termina cuando sale por arriba
  scrub = true,
}) {
  const { ref, ctx } = useGsapContext();
  const videoRef = useRef(null);

  useEffect(() => {
    const wrap = ref.current;
    const v = videoRef.current;
    if (!wrap || !v) return;

    let duration = 0;

    const onMeta = () => {
      duration = v.duration || 0;

      ctx.current.add(() => {
        // resguardo por si rango está fuera de 0..1
        const clamp01 = (x) => Math.max(0, Math.min(1, x));
        const sF = clamp01(range[0]);
        const eF = clamp01(range[1]);

        // al cargar, posicionarse al start
        v.currentTime = (sF * duration) || 0;

        // timeline vacío, usamos onUpdate para scrubbing
        gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start,
            end,
            scrub,
            // markers: true,
            onUpdate: self => {
              if (!duration) return;
              const p = clamp01(self.progress); // 0..1 del tramo visible
              const t = (sF + (eF - sF) * p) * duration;
              if (!Number.isNaN(t)) v.currentTime = t;
            },
            onRefresh: self => {
              // re-sincronizar en refresh/resize
              if (duration) v.currentTime = sF * duration;
            }
          }
        });

        ScrollTrigger.refresh();
      });
    };

    if (v.readyState >= 1) onMeta();
    else v.addEventListener('loadedmetadata', onMeta, { once: true });

    return () => {};
  }, [range, start, end, scrub]);

    return (
      <div
        ref={ref}
        className={`ssv ${fit === 'cover' ? 'ssv--cover' : ''} ${className}`}
        style={{ '--ssv-min-h': minHeightMobile, '--ssv-aspect': aspect }}
        aria-label={ariaLabel}
      >
        <div className="ssv__frame">
          <video
            ref={videoRef}
            className="ssv__video"
            poster={poster}
            preload="auto"
            playsInline
            muted
            // no autoplay: lo “maneja” el scroll
            controls={false}
            controlsList="nodownload nofullscreen noplaybackrate"
            disablePictureInPicture
          >
            {sources.map((s, i) => (
              <source key={i} src={s.src} type={s.type} />
            ))}
          </video>
        </div>
      </div>
    );
}
