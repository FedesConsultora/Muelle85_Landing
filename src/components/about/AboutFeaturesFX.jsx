import { useEffect } from 'react';
import { useGsapContext } from '../../hooks/useGsapContext';
import { gsap, ScrollTrigger } from '../../lib/gsap/setupGsap';

// Íconos planos (sin fondo) desde /public/img
const DEFAULT_FEATURES = [
  { key: 'offroad', icon: '/img/feat-offroad.svg',  title: 'Capacidad off-road extrema',  desc: 'Chasis “Beast Mode” y suspensión independiente.' },
  { key: 'energy',  icon: '/img/feat-energy.svg',   title: 'Autonomía total',             desc: '570 W en paneles solares y baterías de ciclo profundo.' },
  { key: 'safety',  icon: '/img/feat-shield.svg',   title: 'Aislación y seguridad total', desc: 'Doble techo, doble piso y poliurea ultrarresistente.' },
  { key: 'comfort', icon: '/img/feat-comfort.svg',  title: 'Confort inteligente',         desc: 'Cama king-size, Wi-Fi satelital y calefacción diésel.' },
];

export default function AboutFeaturesFX({
  features = DEFAULT_FEATURES,

  // Tuning
  desktopScrub = 0.65,
  desktopEndFactor = 1.35, // queda un toque más
  holdTail = 0.28,         // “ratito” antes de soltar
  cardStagger = 0.10,
}) {
  const { ref, ctx } = useGsapContext();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    ctx.current.add(() => {
      const wrap  = root.querySelector('[data-fx="wrap"]'); // contenedor que “sube”
      const head  = root.querySelector('[data-fx="head"]');
      const title = root.querySelector('[data-fx="title"]');
      const lead  = root.querySelector('[data-fx="lead"]');
      const cards = gsap.utils.toArray(root.querySelectorAll('[data-fx="card"]'));

      // Estado inicial común
      gsap.set(wrap, { yPercent: 14 });
      gsap.set([head, title, lead], {
        autoAlpha: 0, scale: 1.14, yPercent: -8, transformOrigin: '50% 0%',
        willChange: 'transform, opacity, filter',
      });
      gsap.set(cards, {
        autoAlpha: 0, y: -34, rotate: -6, skewY: -3, scale: 0.98, filter: 'blur(6px)',
        transformOrigin: '50% 0%', willChange: 'transform, opacity, filter',
      });

      // ===== Desktop (pin + scrub + hold) =====
      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          // Fase 1 — subir (sin pin) hasta su posición final
          gsap.to(wrap, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 90%',
              end: 'top top',
              scrub: true,
            }
          });

          // Fase 2 — pin + animaciones + hold
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * desktopEndFactor)}`,
              scrub: desktopScrub,
              pin: true,
              pinSpacing: true,
              pinReparent: true,
              anticipatePin: 1,
            }
          });

          // Texto (zoom-out + fade)
          tl.to([head, title, lead], {
            autoAlpha: 1, scale: 1, yPercent: 0,
            duration: 0.33, ease: 'none'
          }, 0);

          // Tarjetas (más vistosas: caída con skew/rotate, overshoot y “jelly”)
          tl.to(cards, {
            autoAlpha: 1, filter: 'blur(0px)',
            keyframes: [
              { y: 22, rotate: 4, skewY: 2, scale: 1.03, duration: 0.16, ease: 'back.out(1.6)' },
              { y: -6, rotate: -1, skewY: 0, scale: 1.00, duration: 0.10, ease: 'power1.inOut' },
              { y: 0,  rotate:  0,               duration: 0.10, ease: 'power1.out' }
            ],
            ease: 'none',
            stagger: { each: Math.max(0.06, cardStagger), from: 'random' }
          }, 0.33);

          // Parallax muy leve durante el pin (texto sube +2%, grid baja -2%)
          const grid = root.querySelector('.about__grid');
          tl.to(head, { yPercent: -2, duration: 0.20, ease: 'none' }, 0.33);
          tl.to(grid, { yPercent:  2, duration: 0.20, ease: 'none' }, 0.33);

          // Hold final
          tl.addLabel('hold', 0.70).to({}, { duration: holdTail });
        },

        // ===== Mobile/Tablet (sin pin). Cards por **entrada individual** =====
        '(max-width: 1023.98px)': () => {
          // Sube el bloque mientras entra en viewport
          gsap.to(wrap, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 92%',
              end: 'top 65%',
              scrub: true,
            }
          });

          // Texto: una vez dentro
          gsap.to([head, title, lead], {
            autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.28, ease: 'power1.out',
            scrollTrigger: {
              trigger: head,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          });

          // Cada tarjeta anima cuando **esa tarjeta** entra (batch para rendimiento)
          ScrollTrigger.batch(cards, {
            start: 'top 90%',
            onEnter: batch => {
              gsap.to(batch, {
                autoAlpha: 1, y: 0, rotate: 0, skewY: 0, scale: 1, filter: 'blur(0px)',
                duration: 0.30, ease: 'back.out(1.6)',
                stagger: { each: 0.08 }
              });
            },
            // opcional: si querés que se escondan al volver arriba:
            onLeaveBack: batch => gsap.to(batch, { autoAlpha: 0, y: -24, duration: 0.22, ease: 'power1.in' })
          });
        }
      });

      ScrollTrigger.refresh();
    });

    return () => {};
  }, [desktopScrub, desktopEndFactor, holdTail, cardStagger]);

  return (
    <article ref={ref} className="about__features" aria-label="Características principales">
      <div className="about__features-wrap" data-fx="wrap">
        <header className="about__features-head" data-fx="head">
          <span className="kicker">Parina 210</span>
          <h3 className="about__features-title" data-fx="title">La nave terrestre más capaz del mercado</h3>
          <p className="lead" data-fx="lead">Diseñada para quienes no buscan el camino marcado, sino el suyo.</p>
        </header>

        <div className="about__grid about__grid--2x2">
          {features.map((f, i) => (
            <div key={f.key || i} className="feature-card feature-card--flat" data-fx="card">
              <img className="feature-card__iconImg" src={f.icon} alt="" loading={i > 1 ? 'lazy' : 'eager'} />
              <h4 className="feature-card__title">{f.title}</h4>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
