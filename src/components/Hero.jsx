// src/components/Hero.jsx
// Hero con video de fondo + overlay de texto. Mobile-first.
// El video se centra usando object-position para mantener el camper visible.
export default function Hero() {
  return (
    <section id="hero" className="hero" aria-label="Hero principal">
      <div className="hero__media">
        <video
          className="hero__video"
          src="/video/hero.mp4"
          poster="/img/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero__gradient" aria-hidden="true" />
      </div>

      <div className="hero__content container">
        <span className="eyebrow">Terra Trailers</span>
        <h1>
          No es para los que viajan.<br />
          Es para los que <strong>VIVEN</strong>.
        </h1>
        {/* En hero NO va el botón de "Ver gamas" (según pedido).
            Si luego querés el CTA "Obtén tu viaje de prueba", se agrega aquí. */}
      </div>
    </section>
  );
}
