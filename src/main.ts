import './index.css';
import './app-root';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { applyLocaleFromRoute, applyDeepLinkTab } from './lib/route-bootstrap';
import { initAuth } from './store/auth-store';
import { extractJoinCode } from './lib/league-invite';

inject();
injectSpeedInsights();

// Aplica el tema antes del primer paint para evitar flash
const storedTheme = localStorage.getItem('bm-theme');
if (storedTheme === 'dark') {
  document.documentElement.dataset.theme = 'dark';
}

// Sincroniza el atributo lang con la preferencia guardada
try {
  const storedLocale = JSON.parse(localStorage.getItem('bm-locale') ?? '{}')?.state?.locale;
  if (storedLocale === 'en') document.documentElement.lang = 'en';
} catch { /* ignora */ }

// Locale inicial según la ruta estática (antes del primer render)
applyLocaleFromRoute();

// Inicializa sesión Supabase (no bloqueante); la limpieza de la URL se hace en
// onAuthStateChange tras el intercambio PKCE para evitar borrar el code prematuramente.
initAuth();

// En nativo, escucha el deep link del magic link (custom URL scheme)
import('./lib/native-auth').then(({ isNativePlatform, initNativeDeepLinks }) => {
  if (isNativePlatform()) initNativeDeepLinks();
});

// Configuración nativa para Android/Capacitor
import('./lib/native-setup').then(m => m.initNative());

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