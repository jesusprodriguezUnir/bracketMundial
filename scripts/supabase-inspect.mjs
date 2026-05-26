/**
 * scripts/supabase-inspect.mjs
 *
 * Script de utilidad para conectarse a Supabase desde la terminal,
 * verificar la conexión e inspeccionar las tablas principales (team_news y score_sync_runs).
 *
 * Uso:
 *   node scripts/supabase-inspect.mjs                  # Diagnóstico general y últimos registros
 *   node scripts/supabase-inspect.mjs --news ESP       # Ver últimas noticias de España (o cualquier team_id)
 *   node scripts/supabase-inspect.mjs --runs 10        # Ver las últimas 10 ejecuciones del sincronizador
 */

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ─── Cargador de Variables de Entorno ─────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const ENV = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ENV.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ENV.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: No se encontraron las credenciales de Supabase en el archivo .env.');
  console.error('Asegúrate de configurar VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Argumentos de Línea de Comandos ────────────────────────────────────────
const args = process.argv.slice(2);
const newsIndex = args.indexOf('--news');
const runsIndex = args.indexOf('--runs');

async function getStats() {
  console.log('\n--- 📊 ESTADÍSTICAS GENERALES ---');

  // Contar noticias
  const { count: newsCount, error: newsErr } = await supabase
    .from('team_news')
    .select('*', { count: 'exact', head: true });

  if (newsErr) {
    console.error(`❌ Error al conectar a la tabla team_news: ${newsErr.message}`);
  } else {
    console.log(`✅ Conexión exitosa a team_news. Total registros: ${newsCount}`);
  }

  // Contar runs de sincronización
  const { count: runsCount, error: runsErr } = await supabase
    .from('score_sync_runs')
    .select('*', { count: 'exact', head: true });

  if (runsErr) {
    console.error(`❌ Error al conectar a la tabla score_sync_runs: ${runsErr.message}`);
  } else {
    console.log(`✅ Conexión exitosa a score_sync_runs. Total registros: ${runsCount}`);
  }
}

async function showRecentNews(teamId = null) {
  console.log(`\n--- 📰 NOTICIAS RECIENTES ${teamId ? `(Equipo: ${teamId})` : '(Últimas registradas)'} ---`);

  let query = supabase
    .from('team_news')
    .select('team_id, locale, source, title, published_at')
    .order('published_at', { ascending: false })
    .limit(10);

  if (teamId) {
    query = query.eq('team_id', teamId.toUpperCase());
  }

  const { data, error } = await query;

  if (error) {
    console.error(`❌ Error al obtener noticias: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No se encontraron noticias.');
    return;
  }

  console.table(data.map(item => ({
    Equipo: item.team_id,
    Idioma: item.locale,
    Fuente: item.source,
    Título: item.title.length > 50 ? item.title.slice(0, 47) + '...' : item.title,
    Fecha: new Date(item.published_at).toLocaleString('es-ES')
  })));
}

async function showRecentRuns(limit = 5) {
  console.log(`\n--- 📡 ÚLTIMOS RUNS DE SINCRONIZACIÓN (Límite: ${limit}) ---`);

  const { data, error } = await supabase
    .from('score_sync_runs')
    .select('id, ran_at, source, fixtures_seen, fixtures_updated, http_status, duration_ms, triggered_by')
    .order('ran_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`❌ Error al obtener runs de sincronización: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No se encontraron registros de sincronización.');
    return;
  }

  console.table(data.map(item => ({
    ID: item.id,
    Fecha: new Date(item.ran_at).toLocaleString('es-ES'),
    Fuente: item.source,
    Vistos: item.fixtures_seen,
    Act: item.fixtures_updated,
    Status: item.http_status,
    Duración: `${item.duration_ms}ms`,
    Origen: item.triggered_by
  })));
}

async function main() {
  console.log('🔌 Conectando a Supabase:', SUPABASE_URL);

  if (newsIndex !== -1) {
    const teamId = args[newsIndex + 1];
    if (!teamId) {
      console.error('❌ Especifica el ID del equipo. Ejemplo: --news ESP');
      process.exit(1);
    }
    await showRecentNews(teamId);
  } else if (runsIndex !== -1) {
    const limit = parseInt(args[runsIndex + 1] || '10', 10);
    await showRecentRuns(limit);
  } else {
    // Diagnóstico completo
    await getStats();
    await showRecentNews();
    await showRecentRuns(5);

    console.log('\n💡 Tip: Puedes filtrar resultados en la consola con:');
    console.log('  node scripts/supabase-inspect.mjs --news ESP');
    console.log('  node scripts/supabase-inspect.mjs --runs 10');
  }
}

main().catch(err => {
  console.error('❌ Error inesperado:', err);
});
