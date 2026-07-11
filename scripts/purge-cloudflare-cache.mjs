/**
 * Purga cache en Cloudflare por URL (targeted) o total.
 *
 * Uso:
 *   node scripts/purge-cloudflare-cache.mjs https://bracketmundial.com/ https://bracketmundial.com/sw.js
 *   node scripts/purge-cloudflare-cache.mjs --everything
 *
 * Requiere variables de entorno:
 *   CF_ZONE_ID
 *   CF_API_TOKEN
 */

const args = process.argv.slice(2);
const purgeEverything = args.includes('--everything');
const urls = args.filter(arg => !arg.startsWith('--'));

const zoneId = process.env.CF_ZONE_ID;
const apiToken = process.env.CF_API_TOKEN;

if (!zoneId || !apiToken) {
  console.log('[cloudflare] skip purge: faltan CF_ZONE_ID y/o CF_API_TOKEN');
  process.exit(0);
}

if (!purgeEverything && urls.length === 0) {
  console.error('[cloudflare] no hay URLs para purgar. Usa --everything o pasa una lista de URLs.');
  process.exit(1);
}

const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

const body = purgeEverything
  ? { purge_everything: true }
  : { files: Array.from(new Set(urls)) };

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const result = await response.json().catch(() => ({}));

if (!response.ok || result?.success !== true) {
  console.error('[cloudflare] purge failed', JSON.stringify(result));
  process.exit(1);
}

if (purgeEverything) {
  console.log('[cloudflare] purge everything OK');
} else {
  console.log(`[cloudflare] purga OK (${body.files.length} URL(s))`);
}
