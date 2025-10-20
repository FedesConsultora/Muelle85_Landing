// src/components/Legion.jsx
export default function Legion() {
  return (
    <section id="legion" className="legion" aria-label="Legión Outlander">
      {/* Arte lateral: sólo tiene imagen en desktop vía CSS (no se descarga en mobile) */}
      <div className="legion__art" aria-hidden="true" />
      <div className="legion__content">
        <p className="kicker">No vendemos trailers</p>
        <h2 className="legion__title">
          Te invitamos a una legión de<br />nómadas modernos
        </h2>
        <p className="legion__lead">
          Ser dueño de un M85 es más que tener un tráiler; es tu acceso a la Legión
          Outlander. Una comunidad exclusiva con acceso a expediciones, mapas y un
          espacio para compartir experiencias.
        </p>
      </div>
    </section>
  );
}
