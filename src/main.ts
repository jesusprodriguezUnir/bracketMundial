import './index.css';
import './app-root';
import { inject } from '@vercel/analytics';

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

const root = document.getElementById('root');
if (root) {
  const app = document.createElement('app-root');
  root.appendChild(app);
}