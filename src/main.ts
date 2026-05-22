import './index.css';
import './app-root';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { applyLocaleFromRoute, applyDeepLinkTab } from './lib/route-bootstrap';
import { initAuth } from './store/auth-store';
import { useLocaleStore } from './i18n';

inject();
injectSpeedInsights();

// Aplica el tema antes del primer paint para evitar flash
const storedTheme = localStorage.getItem('bm-theme');
if (storedTheme === 'dark') {
  document.documentElement.dataset.theme = 'dark';
}

// Sincroniza el atributo lang con el store de locale
document.documentElement.lang = useLocaleStore.getState().locale;
useLocaleStore.subscribe(state => {
  document.documentElement.lang = state.locale;
});

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

const root = document.getElementById('root');
if (root) {
  const app = document.createElement('app-root');
  root.appendChild(app);
  // Abre la tab que corresponde a la ruta (deep-link de entrada)
  applyDeepLinkTab();
}