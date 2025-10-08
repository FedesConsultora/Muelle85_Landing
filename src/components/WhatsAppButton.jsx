// src/components/WhatsAppButton.jsx
import { agregarLeadWA } from '../services/appscript';
import { getOrCreateSessionId } from '../utils/session';
import { captureUTMs, getLandingContext } from '../utils/utm';

export default function WhatsAppButton({ idGama, nombreGama }) {
  const phone = process.env.REACT_APP_WA_PHONE; // ej 54911XXXXXX

  const onClick = async () => {
    const sessionId = getOrCreateSessionId();
    const utms = captureUTMs();
    const ctx  = getLandingContext();

    const mensaje = `Hola, quiero info de la gama ${nombreGama}`;
    try {
      await agregarLeadWA({
        id_sesion: sessionId,
        id_gama: idGama,
        telefono_whatsapp: `+${phone}`,
        mensaje_prellenado: mensaje,
        url_entrada: ctx.url_entrada,
        ...utms
      });
    } catch (e) {
      // opcional: mostrar toast; no bloquea el click
      console.warn('No se pudo registrar el lead WA:', e);
    } finally {
      const waURL = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
      window.open(waURL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button className="btn btn-wa" onClick={onClick} aria-label={`Consultar ${nombreGama} por WhatsApp`}>
      Consultar por WhatsApp
    </button>
  );
}
