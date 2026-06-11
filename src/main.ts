// Manejo de errores de carga de chunks dinámicos (despliegues en producción)
const handleChunkError = (error: any) => {
  const message = error?.message || '';
  const name = error?.name || '';
  if (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    (name === 'TypeError' && message.includes('Load failed'))
  ) {
    // Evitar bucles de recarga infinitos si el usuario no tiene conexión real a internet
    const lastReload = sessionStorage.getItem('bm-last-chunk-reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('bm-last-chunk-reload', now.toString());
      window.location.reload();
    }
  }
};

window.addEventListener('error', (e) => {
  handleChunkError(e.error || e);
}, true);

window.addEventListener('unhandledrejection', (e) => {
  handleChunkError(e.reason);
});

import { registerSW } from 'virtual:pwa-register';

registerSW({
  onRegisteredSW(_swUrl, registration) {
    // Chequea updates cada hora: clientes con pestañas abiertas mucho tiempo
    // no se quedan con un SW desfasado entre deploys del Mundial
    if (registration) {
      setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.warn('[PWA] Fallo registrando el service worker', error);
  },
});

import './index.css';
import './app-root';
import { applyLocaleFromRoute, applyDeepLinkTab } from './lib/route-bootstrap';
import { useLocaleStore } from './i18n';
import { initAuth } from './store/auth-store';

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