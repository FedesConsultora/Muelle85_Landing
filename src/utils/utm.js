// src/utils/utm.js
export function captureUTMs() {
  const url = new URL(window.location.href);
  const utm_source   = url.searchParams.get('utm_source')   || '';
  const utm_medium   = url.searchParams.get('utm_medium')   || '';
  const utm_campaign = url.searchParams.get('utm_campaign') || '';
  const utm_content  = url.searchParams.get('utm_content')  || '';
  return { utm_source, utm_medium, utm_campaign, utm_content };
}

export function getLandingContext() {
  return {
    url_entrada: window.location.href,
    origen_referencia: document.referrer || ''
  };
}
