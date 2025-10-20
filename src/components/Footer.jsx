// src/components/Footer.jsx
import React, { useMemo } from 'react';

const WA_PHONE = process.env.REACT_APP_WA_PHONE || ''; // ej: 5491122334455
const IG_URL = process.env.REACT_APP_IG_URL || '#';
const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || 'hola@muelle85.com';

function buildWaLink(text) {
  const t = encodeURIComponent(text);
  if (WA_PHONE) return `https://wa.me/${WA_PHONE}?text=${t}`;
  return `https://wa.me/?text=${t}`;
}

export default function Footer() {
  const waText = useMemo(
    () =>
      'Hola Muelle85 👋 Quiero obtener mi viaje de prueba para Terra Trailers. Vengo desde la landing.',
    []
  );
  const waHref = buildWaLink(waText);

  return (
    <footer id="contacto" className="site-footer" aria-labelledby="footer-title">
      <div className="footer__panel">
        <div className="footer__brand">
          <img src="/img/logoMuelle.webp" alt="Muelle85" />
        </div>

        <div className="footer__content">
          <h2 id="footer-title" className="footer__title">
            Las rutas más duras exigen los compañeros más fuertes.
            <span className="accent"> ¿Estás listo?</span>
          </h2>
            <div className='footer_container'>
                <div className="footer__icons" aria-label="Redes y contacto">
                    <a
                        className="ico ico--wa"
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                        title="WhatsApp"
                    >
                    <img src="/img/icon-wa.svg" alt="" aria-hidden="true" />
                    </a>
                    <a
                        className="ico"
                        href={IG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        title="Instagram"
                    >
                    <img src="/img/icon-ig.svg" alt="" aria-hidden="true" />
                    </a>
                    <a
                        className="ico"
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consulta desde la landing')}`}
                        aria-label="Enviar email"
                        title="Email"
                    >
                    <img src="/img/icon-mail.svg" alt="" aria-hidden="true" />
                    </a>
                </div>

                <a
                    className="footer__cta"
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Obtené tu viaje de prueba
                </a>
            </div>
          
        </div>
      </div>

      <div className="footer__legal">
        © {new Date().getFullYear()} Muelle85 —{' '}
        <a
          href="https://fedes.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__dev"
        >
          Desarrollado por <strong>Fedes Consultora</strong>
        </a>
      </div>
    </footer>
  );
}
