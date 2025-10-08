// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';

export default function Header() {
  const [open, setOpen] = useState(false);

  // Cerrar al cambiar de tamaño (evita menú abierto en desktop)
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = () => setOpen(o => !o);
  const close = () => setOpen(false);

  return (
    <header className={`site-header ${open ? 'is-open' : 'is-overlay'}`}>
      <div className="site-header__bar glass">
        <a href="#top" className="brand" onClick={close} aria-label="Muelle85">
          <img src="/img/muelle85-logo.svg" alt="Muelle85" height="28" />
        </a>

        <button
          className="menu-toggle"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Abrir menú"
          title="Menú"
        >
          <FaBars />
        </button>
      </div>

      <nav
        id="main-nav"
        className="nav-panel"
        data-open={open ? 'true' : 'false'}
        aria-hidden={!open}
      >
        <a href="#nosotros" onClick={close}>Nosotros</a>
        <a href="#ingenieria" onClick={close}>Ingeniería</a>
        <a href="#gamas" onClick={close}>Gamas</a>
        <a href="#contacto" onClick={close}>Contacto</a>
      </nav>
    </header>
  );
}
