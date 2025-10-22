// src/components/Steps.jsx
export default function Steps() {
  return (
    <section id="steps" className="steps" aria-label="Tu aventura comienza hoy">
      <div className="steps__overlay" aria-hidden="true" />
      <div className="steps__content">
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
