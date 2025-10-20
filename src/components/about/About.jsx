import AboutIntro from './AboutIntro';
import AboutGallery from './AboutGallery';
import AboutFeaturesFX from './AboutFeaturesFX';
import WindowPanoramaFX from './WindowPanoramaFX';

export default function About() {
  return (
    <section id="about" className="about" aria-label="Sobre Muelle85">
      <div className="about__inner">
        <AboutIntro />
        <AboutGallery />

        {/* Features: empieza cuando la sección llega a la mitad del viewport */}
        <AboutFeaturesFX
          pin={true}
          scrub={0.7}
          stagger={0.1}
          endFactor={1.3}
          unlockPadding={0.18}
        />

        {/* Ventana/paisaje: vídeo con scrubbing + texto que cae en el segundo 2.5 */}
        <WindowPanoramaFX
          pin={true}
          scrub={0.7}
          endFactor={2.0}
          triggerStart="top top"
          timeForText={3.7}
          holdTop={0.04}                     
          holdEnd={0.12}
          poster="/img/transicion-ventana_3-poster.webp" 
          webm="/video/transicion-ventana_3_optimizado.webm"
          mp4="/video/transicion-ventana_3_optimizado.mp4"
        />
      </div>
    </section>
  );
}
