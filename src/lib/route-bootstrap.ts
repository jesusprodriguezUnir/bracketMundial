// Conecta las URLs estáticas prerenderizadas (SEO) con la SPA:
//  - deriva el locale inicial desde el path (/en/... => en)
//  - tras montar <app-root>, abre la tab correspondiente despachando el
//    evento `navigate` que <bracket-view> ya escucha (sin tocar ese archivo).

import { useLocaleStore, type Locale } from '../i18n';

type Tab = 'hero' | 'groups' | 'squads' | 'calendar' | 'stadiums';

function localeFromPath(path: string): Locale {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'es';
}

function tabFromPath(path: string): Tab {
  const p = path.replace(/^\/en/, '') || '/';
  if (p === '/' || p === '') return 'hero';
  if (p.startsWith('/grupos') || p.startsWith('/groups')) return 'groups';
  if (p.startsWith('/calendario') || p.startsWith('/schedule')) return 'calendar';
  if (p.startsWith('/estadios') || p.startsWith('/stadiums')) return 'stadiums';
  if (
    p.startsWith('/plantillas') ||
    p.startsWith('/squads') ||
    p.startsWith('/seleccion') ||
    p.startsWith('/team')
  ) {
    return 'squads';
  }
  return 'hero';
}

/** Fija el locale inicial según la ruta. Llamar ANTES de montar <app-root>. */
export function applyLocaleFromRoute(): void {
  const path = window.location.pathname;
  // En la raíz exacta respetamos la preferencia guardada del usuario.
  if (path === '/' || path === '/en' || path === '/en/') {
    if (path.startsWith('/en')) useLocaleStore.getState().setLocale('en');
    return;
  }
  const routeLocale = localeFromPath(path);
  if (useLocaleStore.getState().locale !== routeLocale) {
    useLocaleStore.getState().setLocale(routeLocale);
  } else {
    document.documentElement.lang = routeLocale;
  }
}

/** Tras montar la app, abre la tab que corresponde a la ruta estática. */
export function applyDeepLinkTab(): void {
  const tab = tabFromPath(window.location.pathname);
  if (tab === 'hero') return; // tab por defecto, no hace falta navegar

  let attempts = 0;
  const tryDispatch = () => {
    attempts += 1;
    const appRoot = document.querySelector('app-root');
    const bracketView = appRoot?.shadowRoot?.querySelector('bracket-view');
    const navRoot = bracketView?.shadowRoot?.querySelector('div');
    if (navRoot) {
      navRoot.dispatchEvent(
        new CustomEvent('navigate', { detail: tab, bubbles: true, composed: true }),
      );
      return;
    }
    if (attempts < 120) requestAnimationFrame(tryDispatch);
  };
  requestAnimationFrame(tryDispatch);
}
