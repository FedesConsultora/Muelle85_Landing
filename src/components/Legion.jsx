// src/components/Legion.jsx
export default function Legion() {
  return (
    <section id="legion" className="legion" aria-label="Legión Outlander">
      {/* Arte lateral: sólo tiene imagen en desktop vía CSS (no se descarga en mobile) */}
      <div className="legion__art" aria-hidden="true" />
      <div className="legion__content">
        <h2>Tu aventura<br />comienza hoy</h2>
        <ol>
          <li>
            <strong>1. Agendá tu test drive:</strong>  viví una experiencia real off-road.
          </li>
          <li>
            <strong>2. Personalizá tu M85: </strong>elegí tus colores y tapizados y grabá tu frase personal.
          </li>
          <li>
            <strong>3. Unite a la Legión: </strong> recibí tu código de socio exclusivo y comenzá a explorar.
          </li>
        </ol>
       
      </div>
    </section>
  );
}
