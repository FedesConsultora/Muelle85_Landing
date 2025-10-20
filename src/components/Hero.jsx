// src/components/Hero.jsx
export default function Hero() {
  return (
    <section id="hero" className="hero" aria-label="Hero principal">
      <div id="top" className="hero__media">
        <video
          className="hero__video"
          src="/video/hero_optimizado.webm"
          poster="/img/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Tinte gris + gradiente para realismo/legibilidad */}
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
