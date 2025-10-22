// src/components/ui/ScrollScrubVideoFX.jsx
import { useEffect, useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapContext';
import { gsap, ScrollTrigger } from '../../lib/gsap/setupGsap';

/**
 * Scrub de video con GSAP + ScrollTrigger (mobile/desktop).
 * - “Boomerang” alrededor del centro: al entrar arranca adelantado y
 *   rebobina hasta 0 cuando el bloque queda centrado; luego 0→fin.
 * - Acepta múltiples sources (webm/mp4) para iOS.
 */
export default function ScrollScrubVideoFX({
  sources = [],             // [{src, type}]
  poster = '',
  className = '',
  range = [0, 1],           // fracción [inicio, fin] del video (0..1)
  minHeightMobile = '36vh',
  fit = 'cover',
  aspect = '1',
  ariaLabel = 'Vídeo controlado por scroll',

  // Tuning de scroll
  start = 'top bottom',     // entra cuando asoma por abajo
  end   = 'bottom top',     // sale cuando se va por arriba
  scrub = true,

  // Tuning del “boomerang”
  pivotProgress = 0.5,      // dónde cae el 0s del video (0..1 del tramo de scroll)
  preLeadSeconds = 0.35,    // cuánto “adelantado” arranca al entrar (segundos)
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
        const clamp01 = (x) => Math.max(0, Math.min(1, x));
        const sF = clamp01(range[0]);
        const eF = clamp01(range[1]);

        // Límites reales en segundos para el tramo útil
        const startSec = sF * duration;       // suele ser 0
        const endSec   = eF * duration || 0;  // suele ser duration

        // Cuánto adelantamos al entrar (capado para no exceder el tramo)
        const leadSec  = Math.min(Math.max(0, preLeadSeconds), Math.max(0.05, endSec * 0.5));

        // Arrancamos mostrando el “adelantado” (se ve girando enseguida)
        v.currentTime = Math.min(endSec, Math.max(startSec, leadSec));

        // Timeline vacío; mapeamos en onUpdate
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start,
            end,
            scrub,
            // markers: true,
            onUpdate: self => {
              if (!duration) return;

              const p = clamp01(self.progress);           // 0..1
              const pivot = clamp01(pivotProgress);       // ~0.5 (centro de pantalla)

              let t; // tiempo en segundos

              if (p <= pivot) {
                // ENTRADA: de leadSec → 0s mientras se acerca al centro (rebobina)
                const p0 = pivot ? (p / pivot) : 1;       // 0..1
                t = gsap.utils.interpolate(leadSec, startSec, p0);
              } else {
                // SALIDA: de 0s → endSec desde el centro hacia afuera
                const p1 = (p - pivot) / (1 - pivot);     // 0..1
                t = gsap.utils.interpolate(startSec, endSec, clamp01(p1));
              }

              // Set directo (respuesta inmediata al scroll)
              if (!Number.isNaN(t)) v.currentTime = t;
            },
            onRefresh: self => {
              // Re-sincroniza según la posición actual
              const p = clamp01(self.progress);
              const pivot = clamp01(pivotProgress);
              const t = p <= pivot
                ? gsap.utils.interpolate(leadSec, startSec, pivot ? (p / pivot) : 1)
                : gsap.utils.interpolate(startSec, endSec, (p - pivot) / (1 - pivot));
              if (!Number.isNaN(t)) v.currentTime = t;
            }
          }
        });

        // Limpieza si cambia layout
        ScrollTrigger.refresh();
        return () => tl.revert?.();
      });
    };

    if (v.readyState >= 1) onMeta();
    else v.addEventListener('loadedmetadata', onMeta, { once: true });

    return () => v && v.removeEventListener('loadedmetadata', onMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, start, end, scrub, pivotProgress, preLeadSeconds]);

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
