// src/components/about/AboutIntro.jsx
import ScrollScrubVideo from '../ui/ScrollScrubVideo';

export default function AboutIntro() {
  return (
    <article id='nosotros' className="about__intro" aria-label="Nuestra historia">
      <div className="about__copy">
        <h2>Nacimos en el corazón de Córdoba</h2>
        <p className="parrafoHierro">
          Donde el hierro se funde con la naturaleza. Somos artesanos de la aventura y
          forjadores de la libertad. Creamos trailers con una filosofía: hecho para durar.
        </p>
        <p className="about__quote">
          “El Parina 210 es nuestra obra maestra, pero es sólo el comienzo”
          <br />
          <span>– Francisco, creador de M85</span>
        </p>
      </div>
      <div className="about__media">
        <ScrollScrubVideo
          src="/video/camper-giro_2_optimizado.webm"
          poster="/img/camper-poster.webp"
          range={[0, 1]}          // 0–1 => recorre todo el vídeo
          minHeightMobile="34vh"  // altura mínima en mobile
          fit="cover"             // llena el ancho
          aspect="1"           // control de altura
        />
      </div>
    </article>
  );
}
