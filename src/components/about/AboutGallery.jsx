// src/components/about/AboutGallery.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useGsapContext } from '../../hooks/useGsapContext';
import { gsap, ScrollTrigger } from '../../lib/gsap/setupGsap';

const DEFAULT_ITEMS = [
  { key: 'rest',       label: 'Descanso sin límites',        src: '/img/galeria1.webp', alt: 'Cama amplia y confortable dentro del trailer.' },
  { key: 'kitchen',    label: 'Cocina de expedición',        src: '/img/galeria2.webp', alt: 'Módulo de cocina de expedición completamente equipado.' },
  { key: 'energy',     label: 'Energía limpia y sostenible', src: '/img/galeria3.webp', alt: 'Sistema de energía limpia en uso.' },
  { key: 'insulation', label: 'Aislación del mundo',         src: '/img/galeria4.webp', alt: 'Aislación térmica y acústica del interior.' }
];

export default function AboutGallery({
  items = DEFAULT_ITEMS,
  intervalMs = 4000,
  // cuánto se “queda” pinneada: múltiplos de alto de viewport
  pinFactorDesktop = 1.35,
  pinFactorMobile  = 1.05,
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState('next');  // 'next' | 'prev'
  const [tick, setTick] = useState(true);  // reinicia anims (pulso+glint)
  const len = items.length;

  const tRef      = useRef(null);
  const barRef    = useRef(null);
  const tabsRef   = useRef([]);
  const prevIdxRef= useRef(0);
  const rootRef   = useRef(null);
  const visibleRef= useRef(false);

  const { ctx } = useGsapContext();

  // Preload
  useEffect(() => { items.forEach(i => { const im = new Image(); im.src = i.src; }); }, [items]);

  const computeDir = useCallback((from, to) => {
    const fwd = (to - from + len) % len;
    const bwd = (from - to + len) % len;
    return fwd <= bwd ? 'next' : 'prev';
  }, [len]);

  const placePulseAtTab = useCallback((tabEl) => {
    if (!tabEl || !barRef.current) return;
    const barRect = barRef.current.getBoundingClientRect();
    const tRect = tabEl.getBoundingClientRect();
    const center = (tRect.left + tRect.right) / 2 - barRect.left;
    const percent = (center / barRect.width) * 100;
    barRef.current.style.setProperty('--pulse-origin', `${percent}%`);
  }, []);

  const goTo = useCallback((to) => {
    const from = prevIdxRef.current;
    const direction = computeDir(from, to);
    setDir(direction);
    prevIdxRef.current = to;
    setIndex(to);
    placePulseAtTab(tabsRef.current[to]);
    setTick(t => !t);
  }, [computeDir, placePulseAtTab]);

  const next = useCallback(() => goTo((prevIdxRef.current + 1) % len), [goTo, len]);
  const prev = useCallback(() => goTo((prevIdxRef.current - 1 + len) % len), [goTo, len]);

  // Autoplay SOLO cuando visible (y sin reduced-motion)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    clearTimeout(tRef.current);
    if (!reduce && visibleRef.current) {
      tRef.current = setTimeout(next, intervalMs);
    }
    return () => clearTimeout(tRef.current);
  }, [index, next, intervalMs]);

  const onKeyDownTabs = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  };

  // Posicionar pulso al cargar
  useEffect(() => { placePulseAtTab(tabsRef.current[0]); }, [placePulseAtTab]);

  // Pin + dwell (GSAP)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // IO para saber si está visible (y controlar autoplay)
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    }, { threshold: [0, 0.5, 1] });
    io.observe(el);

    ctx.current.add(() => {
      ScrollTrigger.matchMedia({
        // Desktop: se queda más (1.35x viewport aprox)
        '(min-width: 1024px)': () => {
          ScrollTrigger.create({
            trigger: el,
            start: 'top top',
            end:   () => `+=${Math.round(window.innerHeight * pinFactorDesktop)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            // scrub: false -> solo “dwell”, sin scrubbing interno
          });
        },
        // Mobile/Tablet: un dwell cortito para que no sea fácil pasarse
        '(max-width: 1023.98px)': () => {
          ScrollTrigger.create({
            trigger: el,
            start: 'top top',
            end:   () => `+=${Math.round(window.innerHeight * pinFactorMobile)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          });
        }
      });

      ScrollTrigger.refresh();
    });

    return () => {
      io.disconnect();
    };
  }, [pinFactorDesktop, pinFactorMobile, ctx]);

  return (
    <article
      id="ingenieria"
      ref={rootRef}
      className="about__gallery about__gallery--full"
      aria-label="Galería Muelle85"
    >
      <div className="gallery" role="region">
        <div className="gallery__viewport">
          {items.map((it, i) => (
            <figure
              key={it.key}
              className={`gallery__slide ${i === index ? 'is-active' : ''}`}
              aria-hidden={i === index ? 'false' : 'true'}
            >
              <img
                className="gallery__img"
                src={it.src}
                alt={it.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </figure>
          ))}

          <div className="gallery__tintTop" aria-hidden="true" />
          <div className="gallery__vignette" aria-hidden="true" />

          <h2 className="gallery__title">
            <span>Ingeniería con alma:</span><br />
            <span>un hábitat cálido e inteligente</span>
          </h2>

          <div
            ref={barRef}
            className={`gallery__glassbar dir-${dir} ${tick ? 'pulse-a' : 'pulse-b'}`}
            onKeyDown={onKeyDownTabs}
            role="tablist"
            aria-label="Cambiar característica"
          >
            {items.map((it, i) => {
              const active = i === index;
              return (
                <button
                  key={it.key}
                  ref={el => (tabsRef.current[i] = el)}
                  role="tab"
                  aria-selected={active ? 'true' : 'false'}
                  className={`gallery__tab ${active ? 'is-active' : ''}`}
                  data-label={it.label}
                  onClick={() => goTo(i)}
                  title={it.label}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
