// src/components/Steps.jsx
export default function Steps() {
  return (
    <section id="steps" className="steps" aria-label="Tu aventura comienza hoy">
      <div className="steps__overlay" aria-hidden="true" />
      <div className="steps__content">
        <h2>Tu aventura<br />comienza hoy</h2>
        <ol>
          <li>
            <strong>1.</strong> Agendá tu test drive: viví una experiencia real off-road.
          </li>
          <li>
            <strong>2.</strong> Personalizá tu M85: elegí tus colores y tapizados y grabá tu frase personal.
          </li>
          <li>
            <strong>3.</strong> Unite a la Legión: recibí tu código de socio exclusivo y comenzá a explorar.
          </li>
        </ol>
      </div>
    </section>
  );
}
