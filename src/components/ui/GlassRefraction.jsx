// src/components/ui/GlassRefraction.jsx
import { useEffect, useRef } from 'react';

/**
 * GlassRefraction — deformación dinámica del fondo en un anillo.
 * Captura el video/fondo visible detrás y lo deforma. Usa un ring ancho (24px)
 * para que la refracción sea notoria. Actualiza a ~6 fps para ser eficiente.
 */
export default function GlassRefraction({
  ringPx = 24,      // grosor del anillo en px
  dpr    = 1,       // escala de captura (1 = baja carga)
  fps    = 6,       // frames por segundo
  borderRadius = 8, // radio del borde
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const video = document.querySelector('.hero__video');
    if (!el || !video) return;

    const W = Math.round(el.clientWidth * dpr);
    const H = Math.round(el.clientHeight * dpr);
    const srcCanvas = document.createElement('canvas');
    const dstCanvas = document.createElement('canvas');
    srcCanvas.width = dstCanvas.width = W;
    srcCanvas.height = dstCanvas.height = H;
    const sctx = srcCanvas.getContext('2d');
    const dctx = dstCanvas.getContext('2d');

    const draw = () => {
      const rect = el.getBoundingClientRect();
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const vw  = video.videoWidth  || 0;
      const vh  = video.videoHeight || 0;
      if (!vw || !vh) return;

      const scale = Math.max(vpW / vw, vpH / vh);
      const rW = vw * scale;
      const rH = vh * scale;
      const offX = (vpW - rW) / 2;
      const offY = (vpH - rH) / 2;
      const sx = (rect.left - offX) / scale;
      const sy = (rect.top  - offY) / scale;
      const sw = rect.width  / scale;
      const sh = rect.height / scale;

      // captura
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);

      // limpia destino
      dctx.clearRect(0, 0, W, H);

      // parámetros
      const BR  = Math.round(borderRadius * dpr);
      const ring = Math.round(ringPx * dpr);
      const SCALE_EDGE   = 1.20;
      const SCALE_CORNER = 1.30;
      const BLUR_EDGE    = 2.0;
      const DISP_ALPHA   = 0.40;
      const DISP_OFF     = 2.0 * dpr;

      // helpers
      const roundRect = (c,x,y,w,h,r) => {
        const rr = Math.min(r, Math.min(w,h)/2);
        c.beginPath();
        c.moveTo(x+rr, y);
        c.arcTo(x+w, y, x+w, y+h, rr);
        c.arcTo(x+w, y+h, x,   y+h, rr);
        c.arcTo(x,   y+h, x,   y,   rr);
        c.arcTo(x,   y,   x+w, y,   rr);
        c.closePath();
      };
      const clipRing = (side) => {
        dctx.save();
        // anillo
        roundRect(dctx, 0, 0, W, H, BR);
        roundRect(dctx, ring, ring, W-2*ring, H-2*ring, Math.max(0, BR-ring));
        dctx.clip('evenodd');
        // restringe a side
        dctx.beginPath();
        switch(side){
          case 'top':    dctx.rect(0,0,W,ring+BR); break;
          case 'bottom': dctx.rect(0,H-(ring+BR),W,ring+BR); break;
          case 'left':   dctx.rect(0,0,ring+BR,H); break;
          case 'right':  dctx.rect(W-(ring+BR),0,ring+BR,H); break;
          case 'tl': dctx.rect(0,0,ring+BR,ring+BR); break;
          case 'tr': dctx.rect(W-(ring+BR),0,ring+BR,ring+BR); break;
          case 'bl': dctx.rect(0,H-(ring+BR),ring+BR,ring+BR); break;
          case 'br': dctx.rect(W-(ring+BR),H-(ring+BR),ring+BR,ring+BR); break;
          default: dctx.rect(0,0,W,H);
        }
        dctx.clip();
      };
      // dibuja bordes
      const drawEdge = (side, sxMul, syMul) => {
        clipRing(side);
        dctx.save();
        dctx.filter = `blur(${BLUR_EDGE}px)`;
        switch(side){
          case 'top':
            dctx.translate(W/2, 0); dctx.scale(sxMul, syMul); dctx.translate(-W/2, 0); break;
          case 'bottom':
            dctx.translate(W/2, H); dctx.scale(sxMul, syMul); dctx.translate(-W/2, -H); break;
          case 'left':
            dctx.translate(0, H/2); dctx.scale(sxMul, syMul); dctx.translate(0, -H/2); break;
          case 'right':
            dctx.translate(W, H/2); dctx.scale(sxMul, syMul); dctx.translate(-W, -H/2); break;
        }
        // base
        dctx.drawImage(srcCanvas, 0, 0);
        // dispersión
        dctx.globalCompositeOperation = 'screen';
        dctx.globalAlpha = DISP_ALPHA;
        if (side === 'top' || side === 'bottom') {
          dctx.drawImage(srcCanvas, 0, -DISP_OFF);
          dctx.globalAlpha = DISP_ALPHA * 0.8;
          dctx.drawImage(srcCanvas, 0, +DISP_OFF);
        } else {
          dctx.drawImage(srcCanvas, -DISP_OFF, 0);
          dctx.globalAlpha = DISP_ALPHA * 0.8;
          dctx.drawImage(srcCanvas, +DISP_OFF, 0);
        }
        dctx.restore();
        dctx.restore();
      };
      const drawCorner = (side,cx,cy) => {
        clipRing(side);
        dctx.save();
        dctx.filter = `blur(${BLUR_EDGE + 0.6}px)`;
        dctx.translate(cx,cy);
        dctx.scale(SCALE_CORNER, SCALE_CORNER);
        dctx.translate(-cx,-cy);
        dctx.drawImage(srcCanvas,0,0);
        dctx.globalCompositeOperation = 'screen';
        dctx.globalAlpha = DISP_ALPHA;
        const off = DISP_OFF;
        switch(side){
          case 'tl': dctx.drawImage(srcCanvas, -off, -off); break;
          case 'tr': dctx.drawImage(srcCanvas, +off, -off); break;
          case 'bl': dctx.drawImage(srcCanvas, -off, +off); break;
          case 'br': dctx.drawImage(srcCanvas, +off, +off); break;
        }
        dctx.restore();
        dctx.restore();
      };

      drawEdge('top', 1.02, SCALE_EDGE);
      drawEdge('bottom',1.02, SCALE_EDGE);
      drawEdge('left',SCALE_EDGE,1.02);
      drawEdge('right',SCALE_EDGE,1.02);
      drawCorner('tl',0,0);
      drawCorner('tr',W,0);
      drawCorner('bl',0,H);
      drawCorner('br',W,H);

      el.style.setProperty('--glass-bg', `url("${dstCanvas.toDataURL('image/png')}")`);
    };

    draw(); // una sola vez
  }, [ringPx, dpr, fps, borderRadius]);

  return <div className="glass__refract" ref={ref} />;
}
