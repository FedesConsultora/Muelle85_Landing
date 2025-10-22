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
      const cards = gsap.utils.toArray(root.querySelectorAll('[data-fx="card"]'));

      // ✅ Texto SIEMPRE visible de entrada (sin scroll-anim). Sólo damos aire al contenedor.
      gsap.set(wrap, { yPercent: 14 });
      // Cards arrancan ocultas y con “energía” para una caída vistosa
      gsap.set(cards, {
        autoAlpha: 0, y: -34, rotate: -6, skewY: -3, scale: 0.98, filter: 'blur(6px)',
        transformOrigin: '50% 0%', willChange: 'transform, opacity, filter',
      });

      ScrollTrigger.matchMedia({
        // ===== Desktop: Rise (sin pin), luego Pin + cards + hold =====
        '(min-width: 1024px)': () => {
          // Fase 1 — subir suave hasta su lugar (sin pin)
          gsap.to(wrap, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 92%',
              end:   'top top',
              scrub: true,
            }
          });

          // Fase 2 — pin + anim de cards + hold final
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end:   () => `+=${Math.round(window.innerHeight * desktopEndFactor)}`,
              scrub: desktopScrub,
              pin: true,
              pinSpacing: true,
              pinReparent: true,
              anticipatePin: 1,
              // markers: true,
            }
          });

          // (No animamos el texto aquí: ya está visible). Damos sólo un parallax mínimo.
          tl.to(head, { yPercent: -1.5, duration: 0.25, ease: 'none' }, 0);

          // Tarjetas — caída más vistosa (overshoot + jelly) con stagger
          tl.to(cards, {
            autoAlpha: 1, filter: 'blur(0px)',
            keyframes: [
              { y: 22, rotate: 4,  skewY:  2, scale: 1.03, duration: 0.16, ease: 'back.out(1.6)' },
              { y: -6, rotate: -1, skewY:  0, scale: 1.00, duration: 0.10, ease: 'power1.inOut' },
              { y:  0, rotate:  0,               scale: 1.00, duration: 0.10, ease: 'power1.out'  }
            ],
            ease: 'none',
            stagger: { each: Math.max(0.06, cardStagger), from: 'random' }
          }, 0.10);

          // Hold final antes de liberar la sección
          tl.addLabel('hold', 0.70).to({}, { duration: holdTail });
        },

        // ===== Mobile/Tablet: sin pin. Texto ya visible. Cards por entrada individual =====
        '(max-width: 1023.98px)': () => {
          // Sube el bloque un toque mientras entra (sin ocultar texto)
          gsap.to(wrap, {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 90%',
              end:   'top 60%',
              scrub: true,
            }
          });

          // Cada tarjeta anima cuando **esa tarjeta** llega a ~mitad de pantalla
          ScrollTrigger.batch(cards, {
            start: 'top 55%', // 👈 mitad de pantalla aprox
            onEnter: batch => {
              gsap.to(batch, {
                autoAlpha: 1, y: 0, rotate: 0, skewY: 0, scale: 1, filter: 'blur(0px)',
                duration: 0.32, ease: 'back.out(1.6)',
                stagger: { each: 0.08 }
              });
            },
            // opcional: si volvés para arriba, podés re-ocultar
            onLeaveBack: batch => gsap.to(batch, { autoAlpha: 0, y: -22, duration: 0.22, ease: 'power1.in' })
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
