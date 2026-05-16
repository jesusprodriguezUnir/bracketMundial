import './index.css';
import './app-root';
import { inject } from '@vercel/analytics';
import { applyLocaleFromRoute, applyDeepLinkTab } from './lib/route-bootstrap';
import { initAuth } from './store/auth-store';
import { extractJoinCode } from './lib/league-invite';

inject();

// Aplica el tema antes del primer paint para evitar flash
const storedTheme = localStorage.getItem('bm-theme');
if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.dataset.theme = 'dark';
}

// Sincroniza el atributo lang con la preferencia guardada
try {
  const storedLocale = JSON.parse(localStorage.getItem('bm-locale') ?? '{}')?.state?.locale;
  if (storedLocale === 'en') document.documentElement.lang = 'en';
} catch { /* ignora */ }

// Locale inicial según la ruta estática (antes del primer render)
applyLocaleFromRoute();

// Inicializa sesión Supabase (no bloqueante) y limpia token del magic link de la URL
initAuth();
if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
  history.replaceState(null, '', window.location.pathname);
}

// En nativo, escucha el deep link del magic link (custom URL scheme)
import('./lib/native-auth').then(({ isNativePlatform, initNativeDeepLinks }) => {
  if (isNativePlatform()) initNativeDeepLinks();
});

// Detecta enlace de invitación a liga (?join=CODE) y guarda en sessionStorage
const joinCode = extractJoinCode();
if (joinCode) sessionStorage.setItem('bm-join-code', joinCode);

const root = document.getElementById('root');
if (root) {
  // Remove SEO pre-render content before mounting the Lit app
  root.innerHTML = '';
  const app = document.createElement('app-root');
  root.appendChild(app);
  // Abre la tab que corresponde a la ruta (deep-link de entrada)
  applyDeepLinkTab();
}