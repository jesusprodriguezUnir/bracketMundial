// Utilidades compartidas para los scripts de grabación / captura.
// Usado por: record-video.mjs, record-reel.mjs, generate-play-assets.mjs,
// generate-x-post.mjs.
//
// Toda la navegación se hace despachando el evento custom `navigate` que
// <bracket-view> ya escucha (ver src/bracket-view.ts: @navigate -> _selectTab).
// Esto es independiente del idioma y no depende de etiquetas de texto.

import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const rootDir = join(__dirname, '..', '..');

export const DEV_URL = 'http://localhost:5173';

// ── claves de vista (PhaseTab en src/bracket-view.ts) ──
// Cada vista acepta su clave en inglés y un alias en español.
export const VIEW_MAP = {
  hero:     { tab: 'hero',     es: 'Inicio',       en: 'Home' },
  groups:   { tab: 'groups',   es: 'Grupos',       en: 'Groups' },
  matchday: { tab: 'matchday', es: 'Jornadas',     en: 'Matchday' },
  knockout: { tab: 'knockout', es: 'Cruces',       en: 'Knockout' },
  squads:   { tab: 'squads',   es: 'Equipos',      en: 'Teams' },
  calendar: { tab: 'calendar', es: 'Calendario',   en: 'Schedule' },
  stadiums: { tab: 'stadiums', es: 'Estadios',     en: 'Stadiums' },
  coaches:  { tab: 'coaches',  es: 'Entrenadores', en: 'Coaches' },
  guide:    { tab: 'guide',    es: 'Guía',         en: 'Guide' },
  'guide-print': { tab: 'guide-print', es: 'Guía Imprimible', en: 'Print Guide' },
  league:   { tab: 'league',   es: 'Liga',         en: 'League' },
};

// Alias en español -> clave canónica.
const VIEW_ALIASES = {
  inicio: 'hero', home: 'hero', hero: 'hero',
  grupos: 'groups', groups: 'groups', tabla: 'groups', table: 'groups',
  jornadas: 'matchday', jornada: 'matchday', matchday: 'matchday', partidos: 'matchday', fixtures: 'matchday',
  cruces: 'knockout', knockout: 'knockout', eliminatorias: 'knockout',
  equipos: 'squads', squads: 'squads', plantillas: 'squads', teams: 'squads', clubes: 'squads', clubs: 'squads',
  calendario: 'calendar', calendar: 'calendar', schedule: 'calendar',
  estadios: 'stadiums', stadiums: 'stadiums',
  entrenadores: 'coaches', coaches: 'coaches', dt: 'coaches',
  guia: 'guide', guía: 'guide', guide: 'guide',
  'guide-print': 'guide-print', 'guide-pdf': 'guide-print',
  liga: 'league', league: 'league', porra: 'league', miniliga: 'league',
};

/** Normaliza una clave de vista escrita por el usuario (ES o EN). */
export function resolveViewKey(raw) {
  const k = String(raw || '').trim().toLowerCase();
  return VIEW_ALIASES[k] ?? null;
}

/** Lista de vistas grabables (claves canónicas). */
export const VIEW_KEYS = Object.keys(VIEW_MAP);

// ── helpers básicos ──

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function waitForServer(url = DEV_URL, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

/** Arranca `npm run dev` y devuelve el proceso. */
export function startDevServer() {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['run', 'dev'], {
      cwd: rootDir, shell: true, stdio: 'pipe',
    });
    proc.stdout.on('data', () => {});
    proc.stderr.on('data', () => {});
    setTimeout(() => resolve(proc), 4000);
  });
}

/** Arranca el dev server y espera a que responda. Lanza si no inicia. */
export async function ensureDevServer() {
  const server = await startDevServer();
  if (!await waitForServer(DEV_URL)) {
    server.kill();
    throw new Error('El servidor dev no inició');
  }
  return server;
}

// ── conversión de video ──

/** Convierte un WebM crudo de Playwright a MP4 H.264 con ffmpeg y opcionalmente lo recorta al inicio. */
export function convertToMp4(rawWebmPath, outMp4Path, startSeconds = 0) {
  return new Promise((resolve, reject) => {
    const ssArg = startSeconds > 0 ? `-ss ${startSeconds}` : '';
    const cmd = `ffmpeg -y -i "${rawWebmPath}" ${ssArg} -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${outMp4Path}"`;
    exec(cmd, (err) => {
      if (err) reject(new Error(`ffmpeg falló: ${err.message}`));
      else resolve(outMp4Path);
    });
  });
}

// ── navegación ──

/**
 * Navega a una vista despachando el evento `navigate` en <bracket-view>.
 * `viewKey` debe ser una clave canónica de VIEW_MAP.
 */
export async function gotoView(page, viewKey) {
  const entry = VIEW_MAP[viewKey];
  if (!entry) throw new Error(`Vista desconocida: ${viewKey}`);
  await page.evaluate((tab) => {
    const bracket = document.querySelector('app-root')
      ?.shadowRoot?.querySelector('bracket-view')
      ?? document.querySelector('bracket-view');
    const target = bracket?.shadowRoot?.querySelector('.view-container') ?? bracket;
    target?.dispatchEvent(new CustomEvent('navigate', { detail: tab, bubbles: true, composed: true }));
  }, entry.tab);
  await sleep(1100);
}

/** Scroll suave acumulando pequeños wheels para que se vea fluido en video. */
export async function smoothScroll(page, pixels, ms) {
  const steps = Math.max(6, Math.min(20, Math.floor(ms / 60)));
  const delay = ms / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, pixels / steps);
    await sleep(delay);
  }
}

// ── idioma / tema ──

/**
 * Aplica idioma y tema vía localStorage y recarga para que la app los lea.
 * Llamar tras el primer page.goto.
 */
export async function applyLocaleAndTheme(page, { lang = 'es', theme = 'light' } = {}) {
  await page.evaluate(({ lang, theme }) => {
    localStorage.setItem('bm-locale', lang);
    localStorage.setItem('bm-theme', theme);
  }, { lang, theme });
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(2000);
}

// ── overlay de texto (estilo Panini, quemado en la captura/video) ──

/**
 * Inyecta un banner de texto fijo sobre la página. Permanece visible hasta
 * que la captura/grabación termina, por lo que queda incrustado en el output.
 *
 * @param {import('playwright').Page} page
 * @param {string} text  Texto a mostrar (puede tener saltos de línea \n).
 * @param {{position?: 'top'|'bottom', accent?: string}} [opts]
 */
export async function injectTextOverlay(page, text, opts = {}) {
  const position = opts.position ?? 'bottom';
  const accent = opts.accent ?? '#e8612c'; // --retro-orange aproximado
  await page.evaluate(({ text, position, accent }) => {
    document.getElementById('__bm_overlay')?.remove();
    const box = document.createElement('div');
    box.id = '__bm_overlay';
    box.textContent = text;
    Object.assign(box.style, {
      position: 'fixed',
      left: '24px',
      right: '24px',
      [position]: '40px',
      zIndex: '2147483647',
      padding: '20px 24px',
      background: accent,
      color: '#fff8e7',
      font: '700 38px/1.15 "Bowlby One", "Archivo Black", Impact, sans-serif',
      letterSpacing: '0.5px',
      textAlign: 'center',
      whiteSpace: 'pre-line',
      border: '4px solid #1a1933',
      borderRadius: '0',
      boxShadow: '8px 8px 0 #1a1933',
      textShadow: '2px 2px 0 #1a1933',
      pointerEvents: 'none',
    });
    document.body.appendChild(box);
  }, { text, position, accent });
}

/** Quita el overlay de texto si existe. */
export async function removeTextOverlay(page) {
  await page.evaluate(() => document.getElementById('__bm_overlay')?.remove());
}
