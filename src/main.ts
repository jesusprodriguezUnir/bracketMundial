import './index.css';
import './app-root';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { applyLocaleFromRoute, applyDeepLinkTab } from './lib/route-bootstrap';
import { useLocaleStore } from './i18n';
import { initAuth } from './store/auth-store';

inject();
injectSpeedInsights();

// Aplica el tema antes del primer paint para evitar flash
const storedTheme = localStorage.getItem('bm-theme');
if (storedTheme === 'dark') {
  document.documentElement.dataset.theme = 'dark';
}

// Aplica preferencias de accesibilidad antes del primer paint
const storedColorblind = localStorage.getItem('bm-colorblind');
if (storedColorblind) {
  document.documentElement.dataset.colorblind = storedColorblind;
}
const storedPatterns = localStorage.getItem('bm-accessibility-patterns');
if (storedPatterns === 'true') {
  document.documentElement.dataset.accessibilityPatterns = 'true';
}
const storedHighLegibility = localStorage.getItem('bm-high-legibility');
if (storedHighLegibility === 'true') {
  document.documentElement.dataset.highLegibility = 'true';
}
const storedTextScale = localStorage.getItem('bm-text-scale');
if (storedTextScale) {
  document.documentElement.dataset.textScale = storedTextScale;
}

// Sincroniza el atributo lang con el store de locale
document.documentElement.lang = useLocaleStore.getState().locale;
useLocaleStore.subscribe(state => {
  document.documentElement.lang = state.locale;
});

// Locale inicial según la ruta estática (antes del primer render)
applyLocaleFromRoute();

// En nativo, escucha el deep link del magic link (custom URL scheme)
import('./lib/native-auth').then(({ isNativePlatform, initNativeDeepLinks }) => {
  if (isNativePlatform()) initNativeDeepLinks();
});

// Configuración nativa para Android/Capacitor
import('./lib/native-setup').then(m => m.initNative());

// Inicializar auth de Supabase (PKCE, magic link, session recovery)
initAuth();

const root = document.getElementById('root');
if (root) {
  const app = document.createElement('app-root');
  root.appendChild(app);
  // Abre la tab que corresponde a la ruta (deep-link de entrada)
  applyDeepLinkTab();
}