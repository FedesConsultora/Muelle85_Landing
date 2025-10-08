// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa6';

export default function Header({id}) {
  const [open, setOpen] = useState(false);

  // Bloquear scroll del body solo en mobile cuando está abierto
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    document.body.classList.toggle('no-scroll', open && !isDesktop);
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  useEffect(() => {
    // Si paso a desktop, cierro el menú
    const m = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setOpen(false);
    m.addEventListener?.('change', onChange);
    return () => m.removeEventListener?.('change', onChange);
  }, []);

  const toggle = () => setOpen(o => !o);
  const close = () => setOpen(false);

  return (
    <header id={id} className={`site-header ${open ? 'is-open' : ''}`}>
      {/* MISMA BARRITA: crece verticalmente en mobile */}
      <div className="site-header__wrap glass">
        <div className="site-header__row">
          <a href="#top" className="brand" onClick={close} aria-label="Muelle85">
            <img src="/img/logoMuelle.png" alt="Muelle85" />
          </a>

          {/* Desktop: nav visible aquí; Mobile: botón hamburguesa */}
          <nav className="nav-inline" aria-label="Navegación principal">
            <a href="#nosotros">Nosotros</a>
            <a href="#ingenieria">Ingeniería</a>
            <a href="#gamas">Gamas</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <button
            className="menu-toggle"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="nav-collapsible"
            aria-label="Abrir menú"
            title="Menú"
          >
            <FaBars />
          </button>
        </div>

        {/* Mobile: el contenedor interior se revela; Desktop: display:none */}
        <nav
          id="nav-collapsible"
          className="nav-collapsible"
          aria-hidden={!open}
          aria-label="Navegación principal"
        >
          <a href="#nosotros" onClick={close}>Nosotros</a>
          <a href="#ingenieria" onClick={close}>Ingeniería</a>
          <a href="#gamas" onClick={close}>Gamas</a>
          <a href="#contacto" onClick={close}>Contacto</a>
        </nav>
      </div>
    </header>
  );
}