// src/components/Gamas.jsx
import { useEffect, useState } from 'react';
import { fetchGamas } from '../services/appscript';
import WhatsAppButton from './WhatsAppButton';

export default function Gamas() {
  const [gamas, setGamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchGamas();
        setGamas(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section id="gamas" className="gamas">
      <div className="container">
        <h2>Nuestras gamas</h2>
        {loading && <p>Cargando...</p>}
        {err && <p className="error">{err}</p>}
        <div className="gamas-grid">
          {gamas.map(g => (
            <article key={g.id_gama} className="gama-card">
              <h3>{g.nombre}</h3>
              <p>La opción ideal para empezar tu próxima aventura.</p>
              <WhatsAppButton idGama={g.id_gama} nombreGama={g.nombre} />
            </article>
          ))}
          {!loading && gamas.length === 0 && !err && (
            <p>No hay gamas publicadas todavía.</p>
          )}
        </div>
      </div>
    </section>
  );
}
