// Plantilla HTML compartida para las pÃ¡ginas estÃ¡ticas prerenderizadas.
// El <head> replica el de index.html (GTM, fuentes, AdSense, PWA) para
// mantener consistencia; sÃ³lo se parametriza lo especÃ­fico de cada pÃ¡gina.

import { OG_IMAGE } from './seo-i18n.mjs';

/**
 * @param {object} p
 * @param {'es'|'en'} p.lang
 * @param {string} p.title
 * @param {string} p.description
 * @param {string} p.canonical       URL absoluta canÃ³nica de esta pÃ¡gina
 * @param {string} p.altEs           URL absoluta equivalente en ES
 * @param {string} p.altEn           URL absoluta equivalente en EN
 * @param {string} p.keywords
 * @param {object|object[]} p.jsonLd Bloque(s) schema.org
 * @param {string} p.body            HTML interno de #root (contenido SEO)
 */
export function renderPage(p) {
  const ogLocale = p.lang === 'en' ? 'en_US' : 'es_ES';
  const jsonLd = Array.isArray(p.jsonLd)
    ? { '@context': 'https://schema.org', '@graph': p.jsonLd }
    : p.jsonLd;

  return `<!DOCTYPE html>
<html lang="${p.lang}">
  <head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-NL5BC7FG');</script>
    <!-- End Google Tag Manager -->
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1a1933" />
    <meta name="description" content="${p.description}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="keywords" content="${p.keywords}" />
    <link rel="canonical" href="${p.canonical}" />
    <link rel="alternate" hreflang="es" href="${p.altEs}" />
    <link rel="alternate" hreflang="en" href="${p.altEn}" />
    <link rel="alternate" hreflang="x-default" href="${p.altEs}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${p.canonical}" />
    <meta property="og:title" content="${p.title}" />
    <meta property="og:description" content="${p.description}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${p.title}" />
    <meta name="twitter:description" content="${p.description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <title>${p.title}</title>
    <meta name="google-adsense-account" content="ca-pub-8196395794772309">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8196395794772309"
     crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Archivo+Black&family=Archivo:wght@400;700;800;900&family=Space+Mono:wght@400;700&display=swap">
    <link href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Archivo+Black&family=Archivo:wght@400;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NL5BC7FG"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <div id="root">
      <div id="seo-landing" style="max-width:980px;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;color:#1a1933;line-height:1.6;">
${p.body}
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
}
