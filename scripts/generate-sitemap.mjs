// Compatibilidad: el sitemap (con hreflang) y robots.txt ahora se generan
// junto con las páginas estáticas SEO en scripts/generate-pages.mjs.
// Este wrapper delega para no dejar un generador duplicado/desactualizado.

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, 'generate-pages.mjs');

const r = spawnSync('npx', ['tsx', target], { stdio: 'inherit', shell: true });
process.exit(r.status ?? 0);
