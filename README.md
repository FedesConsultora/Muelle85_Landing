# Muelle85 · Landing One‑Page (CRA + SCSS + Google Apps Script)

Landing site **mobile‑first** para Muelle85 con **Hero en video**, **header glass** con menú hamburguesa animado y catálogo de **Gamas** leído desde Google Sheets vía **Google Apps Script**. Incluye **tracking de UTMs**, sesión anónima y registro de **leads por WhatsApp**. Estilos con **SCSS (@use)**, arquitectura modular y lista para deploy (Vercel/Netlify).

---

## 1) Objetivos & Alcance

- Presentar la marca y las gamas de campers con foco en **mobile**.
- **Hero** con video centrado en el camper (timelapse de fondo).
- **Header glass** flotante sobre el hero; menú hamburguesa con animación de apertura/cierre.
- Catálogo de **Gamas** proveniente de **Google Sheets** (solo estado `publicado`).
- **Medición mínima**: UTMs + referrer + `session_id` anónimo y **leads de WhatsApp**.
- Código mantenible, desacoplado y escalable para futuras secciones/CTAs.

---

## 2) Pila Tecnológica

- **Frontend**: Create React App (React 18+), **SCSS** con `@use` (sin `@import`).
- **UI interna**: Context API para **Toasts** y **Modales** (sin dependencias externas).
- **Backend de datos**: **Google Apps Script** sobre **Google Sheets** (Web App pública con enlace).
- **Tracking**: UTMs + `session_id` en `localStorage`.
- **Build/Deploy**: Vercel / Netlify / GitHub Pages (SPA).

---

## 3) Estructura del Proyecto

```bash
src/
  components/
    Header.jsx          # header glass + menú hamburguesa animado
    Hero.jsx            # hero en video, overlay de texto
    Gamas.jsx           # listado de gamas (GET Apps Script)
    WhatsAppButton.jsx  # CTA → registra lead + abre wa.me
  components/ui/
    Modal.jsx
    ToastViewport.jsx
  context/
    ModalContext.jsx
    ToastContext.jsx
  providers/
    UIProviders.jsx
  services/
    appscript.js        # fetch a Apps Script (GET/POST form-urlencoded)
  utils/
    session.js          # session_id anónimo
    utm.js              # parseo UTMs/referrer
  styles/
    _variables.scss
    _mixins.scss
    base/_reset.scss
    components/_header.scss
    components/_hero.scss
    components/_toast.scss
    components/_modal.scss
    main.scss
  App.jsx
  index.js
.env.example
```

---

## 4) Modelo de Datos (Google Sheets)

**Pestañas requeridas:**

- **Sesiones**: `id_sesion, fecha_visita, url_entrada, origen_referencia, utm_source, utm_medium, utm_campaign, utm_content`
- **Leads_WhatsApp**: `id_lead, id_sesion, fecha, id_gama, telefono_whatsapp, mensaje_prellenado, url_entrada, utm_source, utm_medium, utm_campaign`
- **Gamas**: `id_gama, nombre, estado` *(“publicado” | “borrador”)*

> El Google Apps Script trabaja con la **hoja activa** (no requiere `spreadsheetId`).

---

## 5) Endpoints (Apps Script)

- **GET** `?action=getGamas` → `[{ id_gama, nombre }]` (solo `estado = "publicado"`)
- **POST** `action=registrarSesion` (`x-www-form-urlencoded`) → upsert en **Sesiones**
- **POST** `action=agregarLeadWA` (`x-www-form-urlencoded`) → append en **Leads_WhatsApp**

> Se utiliza **`application/x-www-form-urlencoded`** para evitar **preflight CORS** y simplificar el despliegue.

---

## 6) Configuración Local

1. **Variables de entorno**  
   Copiar `.env.example` → `.env` y completar:

    ```env
    REACT_APP_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXX/exec
    REACT_APP_WA_PHONE=54911XXXXXXXX
    ```

2. **Instalación**

    ```bash
    npm i
    # o
    yarn
    ```

3. **Desarrollo**

   ```bash
   npm start
   # o
   yarn start
   ```

4. **Build**

   ```bash
   npm run build
   # o
   yarn build
   ```

---

## 7) Estilos & Accesibilidad

- **SCSS con `@use`** para variables/mixins/componentes.
- **Glass Effect**: fondo `rgba(34,33,36,.5)` + `backdrop-filter: blur(10px)` + borde suave.
- **Hero Video**: `object-fit: cover` y `object-position` ajustable para mantener el camper centrado en mobile.
- **A11y**: `aria-expanded`, `aria-controls`, `aria-hidden` en el menú; modales con foco y cierre por `Escape`; toasts en `aria-live`.

---

## 8) Prácticas de Calidad

- **Separación de capas**: componentes (UI), servicios (fetch), utils (utm/session), context (UI global).
- **Errores no bloqueantes** en tracking (console warning y fallback).
- **Tipografías fluidas** con `clamp()`. Contenedor con `--container-max`.
- **Sin dependencias UI** para toast/modal → menor superficie de mantenimiento.

---

## 9) Seguridad & CORS

- Apps Script expuesto como **Web App** “Cualquiera con el enlace”.
- **POST form-url-encoded** para evitar preflight; no se envían cookies ni auth.
- No se guardan datos personales del usuario en sesión; solo `session_id` anónimo + UTMs.

---

## 10) Scripts NPM

- `start` – Dev server de CRA.  
- `build` – Build de producción.  
- `test` – (reserva).  
- `eject` – No usar salvo necesidad puntual.

---

## 11) Roadmap

- CTA “Obtén tu viaje de prueba” (glass) con tracking.
- ScrollSpy + resaltado de sección en el header.
- Eventos de `section_view` y `scroll_%`.
- Skeletons/cargas en Gamas.
- `useConfirm()` basado en Modal (promesa).
- SEO (title/meta/og), sitemap y favicons.
- Tests (React Testing Library).

---

## 13) Licencia

MIT © Muelle85 / Fedes Consultora
