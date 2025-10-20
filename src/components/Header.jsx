import { useEffect, useRef, useState } from 'react';
import { FaBars } from 'react-icons/fa6';
import { gsap, ScrollTrigger } from '../lib/gsap/setupGsap';

/**
 * Header con glass + refracción dinámica + scroll suave + scroll spy
 */
export default function Header({ id }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  // Bloquea scroll en móvil al abrir menú
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    document.body.classList.toggle('no-scroll', open && !mq.matches);
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  // Cierra menú al cruzar breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = () => setOpen(false);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ================== Refracción (canvas) ==================
  useEffect(() => {
    const wrapEl   = wrapRef.current;
    const canvas   = canvasRef.current;
    const video    = document.querySelector('.hero__video');
    if (!wrapEl || !canvas || !video) return;

    const ctxSrc = document.createElement('canvas').getContext('2d');
    const srcCanvas = ctxSrc.canvas; // buffer fuente
    const ctxOut = canvas.getContext('2d'); // canvas visible

    let W = 0, H = 0;
    let sx = 0, sy = 0, sw = 0, sh = 0; // recorte del video
    let BR = 8, RING = 24;              // px CSS
    const DPR = 1;                      // perf-friendly
    const FPS_INTERVAL = 125;           // ~8fps

    const SCALE_EDGE   = 1.20;
    const SCALE_CORNER = 1.30;
    const BLUR_EDGE    = 2.0;
    const DISP_ALPHA   = 0.40;
    const DISP_OFF     = 2.0 * DPR;

    const roundRect = (c,x,y,w,h,r) => {
      const rSafe = Math.max(0, r);
      const rr = Math.min(rSafe, Math.min(w, h) / 2);
      c.beginPath();
      c.moveTo(x+rr, y);
      c.arcTo(x+w,y, x+w,y+h, rr);
      c.arcTo(x+w,y+h, x,  y+h, rr);
      c.arcTo(x,  y+h, x,  y,   rr);
      c.arcTo(x,  y,   x+w,y,   rr);
      c.closePath();
    };

    const computeGeometry = () => {
      const rect = wrapEl.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));

      W = Math.max(2, Math.round(cssW * DPR));
      H = Math.max(2, Math.round(cssH * DPR));

      canvas.width = W;   canvas.height = H;
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';

      srcCanvas.width = W; srcCanvas.height = H;

      const style = getComputedStyle(wrapEl);
      BR = Math.max(0, Math.round(parseFloat(style.borderRadius || '8')));
      RING = 24;

      // mapeo object-fit:cover del <video> a viewport
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const vw  = video.videoWidth  || 1;
      const vh  = video.videoHeight || 1;
      const scale = Math.max(vpW / vw, vpH / vh);
      const rW = vw * scale;
      const rH = vh * scale;
      const offX = (vpW - rW) / 2;
      const offY = (vpH - rH) / 2;

      sx = (rect.left - offX) / scale;
      sy = (rect.top  - offY) / scale;
      sw = rect.width  / scale;
      sh = rect.height / scale;
    };

    const clipRing = (c, side) => {
      c.save();
      // anillo (outer - inner)
      roundRect(c, 0, 0, W, H, Math.round(BR * DPR));
      roundRect(
        c,
        Math.round(RING * DPR),
        Math.round(RING * DPR),
        W - 2*Math.round(RING * DPR),
        H - 2*Math.round(RING * DPR),
        Math.max(0, Math.round(BR*DPR) - Math.round(RING*DPR))
      );
      c.clip('evenodd');

      // sector
      c.beginPath();
      const sector = Math.round(RING * DPR) + Math.round(BR * DPR);
      switch (side) {
        case 'top':    c.rect(0, 0, W, sector); break;
        case 'bottom': c.rect(0, H - sector, W, sector); break;
        case 'left':   c.rect(0, 0, sector, H); break;
        case 'right':  c.rect(W - sector, 0, sector, H); break;
        case 'tl': c.rect(0, 0, sector, sector); break;
        case 'tr': c.rect(W - sector, 0, sector, sector); break;
        case 'bl': c.rect(0, H - sector, sector, sector); break;
        case 'br': c.rect(W - sector, H - sector, sector, sector); break;
        default: c.rect(0,0,W,H);
      }
      c.clip();
    };

    const drawEdge = (side, sxMul, syMul) => {
      const c = ctxOut;
      clipRing(c, side);
      c.save();
      c.filter = `blur(${BLUR_EDGE}px)`;
      switch(side){
        case 'top':    c.translate(W/2, 0); c.scale(sxMul, syMul); c.translate(-W/2, 0); break;
        case 'bottom': c.translate(W/2, H); c.scale(sxMul, syMul); c.translate(-W/2, -H); break;
        case 'left':   c.translate(0, H/2); c.scale(sxMul, syMul); c.translate(0, -H/2); break;
        case 'right':  c.translate(W, H/2); c.scale(sxMul, syMul); c.translate(-W, -H/2); break;
      }
      c.drawImage(srcCanvas, 0, 0);
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = DISP_ALPHA;
      if (side === 'top' || side === 'bottom') {
        c.drawImage(srcCanvas, 0, -DISP_OFF);
        c.globalAlpha = DISP_ALPHA * .8;
        c.drawImage(srcCanvas, 0, +DISP_OFF);
      } else {
        c.drawImage(srcCanvas, -DISP_OFF, 0);
        c.globalAlpha = DISP_ALPHA * .8;
        c.drawImage(srcCanvas, +DISP_OFF, 0);
      }
      c.restore();
      c.restore();
    };

    const drawCorner = (side, cx, cy) => {
      const c = ctxOut;
      clipRing(c, side);
      c.save();
      c.filter = `blur(${BLUR_EDGE + .6}px)`;
      c.translate(cx, cy);
      c.scale(SCALE_CORNER, SCALE_CORNER);
      c.translate(-cx, -cy);
      c.drawImage(srcCanvas, 0, 0);
      c.globalCompositeOperation = 'screen';
      c.globalAlpha = DISP_ALPHA;
      const off = DISP_OFF;
      if (side === 'tl') c.drawImage(srcCanvas, -off, -off);
      if (side === 'tr') c.drawImage(srcCanvas, +off, -off);
      if (side === 'bl') c.drawImage(srcCanvas, -off, +off);
      if (side === 'br') c.drawImage(srcCanvas, +off, +off);
      c.restore();
      c.restore();
    };

    const render = () => {
      // 1) capturar desde el <video>
      ctxSrc.imageSmoothingQuality = 'high';
      ctxSrc.clearRect(0,0,W,H);
      ctxSrc.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);

      // 2) limpiar y dibujar deformaciones
      ctxOut.clearRect(0,0,W,H);
      drawEdge('top', 1.02, SCALE_EDGE);
      drawEdge('bottom', 1.02, SCALE_EDGE);
      drawEdge('left',   SCALE_EDGE, 1.02);
      drawEdge('right',  SCALE_EDGE, 1.02);
      drawCorner('tl', 0, 0);
      drawCorner('tr', W, 0);
      drawCorner('bl', 0, H);
      drawCorner('br', W, H);
    };

    // bucle económico (~8fps) + rAF
    let rafId = 0;
    let intervalId = 0;
    const tick = () => { rafId = requestAnimationFrame(render); };
    const start = () => {
      stop();
      intervalId = window.setInterval(tick, FPS_INTERVAL);
      tick();
    };
    const stop = () => {
      if (intervalId) clearInterval(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
      intervalId = 0; rafId = 0;
    };

    const ensureStart = () => { computeGeometry(); start(); };
    if (video.readyState >= 2) ensureStart();
    else video.addEventListener('loadeddata', ensureStart, { once: true });

    const ro = new ResizeObserver(() => computeGeometry());
    ro.observe(wrapEl);
    window.addEventListener('resize', computeGeometry);

    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', vis);

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener('resize', computeGeometry);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  // ================== Scroll suave en anchors ==================
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // fallbacks tolerantes por si cambian ids
    const FALLBACKS = {
      '#top'       : ['#top', 'body'],
      '#nosotros'  : ['#nosotros', '#about'],
      '#ingenieria': ['#ingenieria', '#steps'],
      '#gamas'     : ['#gamas'],
      '#legion'    : ['#legion'],
      '#contacto'  : ['#contacto', 'footer', '.site-footer'],
    };

    const getHeaderH = () => wrap.getBoundingClientRect().height || 0;

    const resolveTarget = (hash) => {
      const list = FALLBACKS[hash] || [hash];
      for (const sel of list) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    };

    const onClick = (e) => {
      const a = e.currentTarget;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = resolveTarget(href);
      if (!target) return;

      e.preventDefault();
      setOpen(false);

      const top = target.getBoundingClientRect().top + window.scrollY;
      const y = Math.max(0, top - getHeaderH() - 6);

      gsap.to(window, {
        duration: 0.9,
        ease: 'power2.inOut',
        scrollTo: { y, autoKill: true },
        onComplete: () => {
          // foco accesible
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          setTimeout(() => target.removeAttribute('tabindex'), 300);
        }
      });
    };

    const links = Array.from(
      document.querySelectorAll('.nav-inline a[href^="#"], .nav-collapsible a[href^="#"], .brand[href^="#"]')
    );
    links.forEach(a => a.addEventListener('click', onClick));
    return () => links.forEach(a => a.removeEventListener('click', onClick));
  }, []);

  // ================== Scroll spy (link activo) ==================
  useEffect(() => {
    const FALLBACKS = {
      '#top'       : ['#top', 'body'],
      '#nosotros'  : ['#nosotros', '#about'],
      '#ingenieria': ['#ingenieria', '#steps'],
      '#gamas'     : ['#gamas'],
      '#legion'    : ['#legion'],
      '#contacto'  : ['#contacto', 'footer', '.site-footer'],
    };

    const activate = (hash) => {
      document
        .querySelectorAll('.nav-inline a, .nav-collapsible a')
        .forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === hash));
    };

    const triggers = [];
    Object.entries(FALLBACKS).forEach(([hash, sels]) => {
      let el = null;
      for (const s of sels) { el = document.querySelector(s); if (el) break; }
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top+=-64 center', // compensa altura del header
        end: 'bottom center',
        onToggle: (self) => { if (self.isActive) activate(hash); }
      });
      triggers.push(st);
    });

    return () => triggers.forEach(t => t.kill());
  }, []);

  const toggle = () => setOpen(o => !o);
  const close  = () => setOpen(false);

  return (
    <header id={id} className={`site-header ${open ? 'is-open' : ''}`}>
      <div ref={wrapRef} className="site-header__wrap glass">
        {/* Canvas de refracción (se enmascara vía CSS) */}
        <canvas ref={canvasRef} className="glass__refract" aria-hidden="true" />

        <div className="site-header__row">
          <a href="#top" className="brand" onClick={close} aria-label="Muelle85">
            <img src="/img/logoMuelle.webp" alt="Muelle85" />
          </a>

          <nav className="nav-inline" aria-label="Navegación principal">
            <a href="#top">Inicio</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#ingenieria">Ingeniería</a>
            <a href="#legion">Legión</a>
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

        <nav
          id="nav-collapsible"
          className="nav-collapsible"
          aria-hidden={!open}
          aria-label="Navegación principal"
        >
          <a href="#top" onClick={close}>Inicio</a>
          <a href="#nosotros" onClick={close}>Nosotros</a>
          <a href="#ingenieria" onClick={close}>Ingeniería</a>
          <a href="#legion" onClick={close}>Legión</a>
          <a href="#contacto" onClick={close}>Contacto</a>
        </nav>
      </div>
    </header>
  );
}