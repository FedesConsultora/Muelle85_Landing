// src/components/ui/ScrollScrubVideo.jsx
import { useEffect, useRef } from 'react';

export default function ScrollScrubVideo({
  src,
  poster,
  className = '',
  range = [0, 1],
  minHeightMobile = '36vh',
  fit = 'cover',
  aspect = '1',
  ariaLabel = 'Vídeo controlado por scroll',
}) {

  const DEBUG = false;
  const log = (...a) => { if (DEBUG) console.log('[SSV]', ...a); };

  const wrapRef = useRef(null);
  const videoRef = useRef(null);

  const durationRef = useRef(0);
  const hasMetaRef  = useRef(false);
  const visibleRef  = useRef(false);

  // Métricas cacheadas (sin lecturas en cada scroll)
  const metricsRef = useRef({ topAbs: 0, height: 0, vh: 0, total: 1 });

  // Para evitar que el handler de scroll calcule muchas veces por frame
  const rAFScrollRef = useRef(0);

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  // --------- helpers de métricas / progreso ----------
  const computeMetrics = () => {
    const el = wrapRef.current;
    if (!el) return;
    // 1 lectura de layout puntual (no por frame)
    const topAbs = el.getBoundingClientRect().top + window.scrollY;
    const height = el.offsetHeight; // no fuerza reflow
    const vh     = window.innerHeight;
    metricsRef.current = { topAbs, height, vh, total: Math.max(1, height + vh) };
    log('metrics', metricsRef.current);
  };

  const calcProgress = () => {
    const { topAbs, vh, total } = metricsRef.current;
    const topInViewport = topAbs - window.scrollY;
    const passed = vh - topInViewport;
    return clamp01(passed / total); // 0 → entra, 1 → sale
  };

  const updateVideoNow = () => {
    const v = videoRef.current;
    if (!v || !visibleRef.current || !hasMetaRef.current) return;

    const p = calcProgress();
    const dur = durationRef.current || 0;
    const sF = clamp01(range[0]);
    const eF = clamp01(range[1]);
    const start = sF * dur;
    const end   = eF * dur;
    const t = start + (end - start) * p;

    // Set directo para respuesta inmediata (sensación “anclado al scroll”)
    if (!Number.isNaN(t)) {
      v.currentTime = t;
    }
    log('p=', p.toFixed(3), 't=', t.toFixed(3));
  };

  // --------- metadata + warm-up ----------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = async () => {
      durationRef.current = v.duration || 0;
      hasMetaRef.current  = durationRef.current > 0;
      const start = clamp01(range[0]) * durationRef.current;
      v.currentTime = start;
      log('metadata', { duration: durationRef.current, start });

      // Warm-up del decoder para evitar el lag del primer seek
      try { await v.play(); v.pause(); } catch {}

      // Si ya es visible cuando llega la metadata, sincronizá al instante
      computeMetrics();
      updateVideoNow();
    };

    if (v.readyState >= 1) onMeta();
    v.addEventListener('loadedmetadata', onMeta, { once: true });
    return () => v.removeEventListener('loadedmetadata', onMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, range]);

  // --------- IO + scroll listeners ----------
  useEffect(() => {
    const el = wrapRef.current;
    const v  = videoRef.current;
    if (!el || !v) return;

    const onScrollFrame = () => {
      rAFScrollRef.current = 0;
      updateVideoNow();
    };

    const onScroll = () => {
      if (!visibleRef.current) return;
      // Coalescencia en un rAF (pero sigue siendo “durante” el scroll)
      if (!rAFScrollRef.current) {
        rAFScrollRef.current = requestAnimationFrame(onScrollFrame);
      }
    };

    const onResize = () => {
      computeMetrics();
      updateVideoNow();
    };

    // ResizeObserver por si cambia el alto de este artículo
    const ro = new ResizeObserver(() => {
      computeMetrics();
      updateVideoNow();
    });
    ro.observe(el);

    // IO: enciende/apaga los listeners globales solo cuando hace falta
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        log('IO visible=', visibleRef.current, 'ratio=', entry.intersectionRatio.toFixed(2));
        if (visibleRef.current) {
          computeMetrics();   // topAbs puede haber cambiado con cargas arriba
          updateVideoNow();   // primera sync inmediata
          window.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('wheel', onScroll, { passive: true });
          window.addEventListener('touchmove', onScroll, { passive: true });
          window.addEventListener('resize', onResize);
        } else {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('wheel', onScroll);
          window.removeEventListener('touchmove', onScroll);
          window.removeEventListener('resize', onResize);
        }
      },
      { threshold: [0, 0.05, 0.25, 0.5, 0.75, 1] }
    );
    io.observe(el);

    // init (por si ya arranca en pantalla)
    computeMetrics();
    updateVideoNow();

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('touchmove', onScroll);
      window.removeEventListener('resize', onResize);
      if (rAFScrollRef.current) cancelAnimationFrame(rAFScrollRef.current);
      rAFScrollRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <div
      ref={wrapRef}
      className={`ssv ${fit === 'cover' ? 'ssv--cover' : ''} ${className}`}
      style={{ '--ssv-min-h': minHeightMobile, '--ssv-aspect': aspect }}
      aria-label={ariaLabel}
    >
      <div className="ssv__frame">
        <video
          ref={videoRef}
          className="ssv__video"
          src={src}
          poster={poster}
          preload="auto"
          playsInline
          muted
        />
      </div>
    </div>
  );
}
