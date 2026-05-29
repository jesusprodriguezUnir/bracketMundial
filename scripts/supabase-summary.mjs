/**
 * scripts/supabase-summary.mjs
 *
 * Script de utilidad para conectarse a Supabase y generar un informe completo
 * sobre el estado de la base de datos, conexiones de sincronización diaria,
 * ligas actualmente en juego y el resumen de integrantes por liga.
 *
 * Uso:
 *   node scripts/supabase-summary.mjs                 # Reporte completo de diagnóstico, ligas e integrantes
 *   node scripts/supabase-summary.mjs --json          # Reporte en formato JSON plano
 *   node scripts/supabase-summary.mjs --league <id>   # Filtrar detalle solo para una liga específica
 *   node scripts/supabase-summary.mjs --help          # Mostrar ayuda
 */

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ─── Colores ANSI para Consola ────────────────────────────────────────────────
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
};

// ─── Cargador de Variables de Entorno ─────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  try {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  } catch (err) {
    console.error('⚠️ No se pudo leer el archivo .env:', err.message);
  }
  return env;
}

const ENV = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ENV.VITE_SUPABASE_URL;
// Preferimos la Service Role Key para poder bypasear RLS y obtener datos de todas las ligas.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ENV.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ENV.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(`${colors.fgRed}❌ Error: No se encontraron las credenciales de Supabase en el entorno ni en el archivo .env.${colors.reset}`);
  console.error('Asegúrate de configurar VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o VITE_SUPABASE_ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Argumentos de Línea de Comandos ────────────────────────────────────────
const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isHelp = args.includes('--help') || args.includes('-h');
const leagueArgIndex = args.indexOf('--league');
const filterLeagueId = leagueArgIndex !== -1 ? args[leagueArgIndex + 1] : null;

if (isHelp) {
  console.log(`
${colors.bright}${colors.fgCyan}⚽ BRACKET MUNDIAL 2026 - SCRIPT RESUMEN SUPABASE ⚽${colors.reset}

${colors.bright}Uso:${colors.reset}
  node scripts/supabase-summary.mjs [opciones]

${colors.bright}Opciones:${colors.reset}
  --json             Muestra la información estructurada como un objeto JSON (ideal para APIs o logs automáticos).
  --league <id>      Filtra y muestra detalladamente sólo los datos y miembros de una liga específica.
  --help, -h         Muestra este panel de ayuda.
  `);
  process.exit(0);
}

async function getSummaryData() {
  const startPing = Date.now();
  
  // 1. Verificar Conexión y Latencia
  let pingMs = 0;
  let connectionOk = false;
  try {
    const { error } = await supabase.from('leagues').select('id', { count: 'exact', head: true });
    if (!error) {
      connectionOk = true;
      pingMs = Date.now() - startPing;
    }
  } catch {
    connectionOk = false;
  }

  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // 2. Ejecuciones de Sincronización Diarias (últimas 24h)
  const { data: runs24h, error: runsErr } = await supabase
    .from('score_sync_runs')
    .select('*')
    .gte('ran_at', past24h)
    .order('ran_at', { ascending: false });

  const { count: totalRuns, error: totalRunsErr } = await supabase
    .from('score_sync_runs')
    .select('*', { count: 'exact', head: true });

  // 3. Noticias Ingestadas en las últimas 24h
  const { count: news24h, error: newsErr } = await supabase
    .from('team_news')
    .select('*', { count: 'exact', head: true })
    .gte('published_at', past24h);

  const { count: totalNews } = await supabase
    .from('team_news')
    .select('*', { count: 'exact', head: true });

  // 4. Ligas creadas
  const { data: leagues, error: leaguesErr } = await supabase
    .from('leagues')
    .select('*')
    .order('created_at', { ascending: false });

  // 5. Miembros registrados
  const { data: members, error: membersErr } = await supabase
    .from('league_members')
    .select('*')
    .order('joined_at', { ascending: true });

  return {
    connection: {
      ok: connectionOk,
      url: SUPABASE_URL,
      pingMs,
      timestamp: now.toISOString(),
    },
    syncStats: {
      runsLast24h: runs24h ? runs24h.length : 0,
      totalRuns: totalRuns ?? 0,
      successRuns24h: runs24h ? runs24h.filter(r => r.http_status === 200).length : 0,
      failedRuns24h: runs24h ? runs24h.filter(r => r.http_status !== 200).length : 0,
      recentRuns: runs24h ? runs24h.slice(0, 5) : [],
    },
    newsStats: {
      newsLast24h: news24h ?? 0,
      totalNews: totalNews ?? 0,
    },
    leagues: leagues ?? [],
    members: members ?? [],
    errors: {
      runsErr: runsErr?.message,
      totalRunsErr: totalRunsErr?.message,
      newsErr: newsErr?.message,
      leaguesErr: leaguesErr?.message,
      membersErr: membersErr?.message,
    }
  };
}

function printAsciiBanner() {
  console.log(`
${colors.fgGreen}========================================================================${colors.reset}
${colors.bright}${colors.fgYellow}   🏆  BRACKET MUNDIAL 2026 - ESTADO DIARIO DE BASE DE DATOS Y LIGAS  🏆${colors.reset}
${colors.fgGreen}========================================================================${colors.reset}
`);
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function processAndDisplay(data) {
  if (isJson) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  printAsciiBanner();

  // 1. Diagnóstico de Conexión
  console.log(`${colors.bright}🔌 CONEXIÓN SUPABASE:${colors.reset}`);
  if (data.connection.ok) {
    console.log(`  Estado:  ${colors.fgGreen}● ONLINE${colors.reset}`);
    console.log(`  Base de Datos URL: ${colors.fgCyan}${data.connection.url}${colors.reset}`);
    console.log(`  Latencia: ${colors.fgGreen}${data.connection.pingMs} ms${colors.reset}`);
  } else {
    console.log(`  Estado:  ${colors.fgRed}❌ OFFLINE / SIN ACCESO${colors.reset}`);
    console.log(`  Base de Datos URL: ${data.connection.url}`);
    if (data.errors.leaguesErr) {
      console.log(`  Detalle del error: ${data.errors.leaguesErr}`);
    }
  }
  console.log(`  Fecha del reporte: ${formatShortDate(data.connection.timestamp)}\n`);

  // 2. Información Diaria (Conexión/Sincronización diaria)
  console.log(`${colors.bright}📡 ACTIVIDAD DE SINCRONIZACIÓN Y CONTENIDO DE HOY (Últimas 24h):${colors.reset}`);
  const syncRuns = data.syncStats.runsLast24h;
  const syncOk = data.syncStats.successRuns24h;
  const syncFail = data.syncStats.failedRuns24h;

  console.log(`  🔄 Ejecuciones del actualizador de resultados (24h): ${colors.bright}${syncRuns}${colors.reset} runs (${colors.fgGreen}${syncOk} exitosos${colors.reset}, ${colors.fgRed}${syncFail} fallidos${colors.reset})`);
  console.log(`  📊 Historial total de ejecuciones guardadas: ${colors.bright}${data.syncStats.totalRuns}${colors.reset} ejecuciones.`);
  console.log(`  📰 Noticias de selecciones ingestadas hoy: ${colors.fgGreen}${data.newsStats.newsLast24h}${colors.reset} noticias nuevas (Total acumulado: ${data.newsStats.totalNews})\n`);

  if (data.syncStats.recentRuns.length > 0) {
    console.log(`  ${colors.dim}Últimos runs de hoy:${colors.reset}`);
    console.table(data.syncStats.recentRuns.map(r => ({
      'Hora (Local)': formatShortDate(r.ran_at),
      'Vistos': r.fixtures_seen,
      'Actualizados': r.fixtures_updated,
      'Estado HTTP': r.http_status,
      'Duración': `${r.duration_ms}ms`,
      'Disparador': r.triggered_by
    })));
    console.log('');
  }

  // 3. Resumen de Ligas e Integrantes
  const totalLeagues = data.leagues.length;
  const totalMembers = data.members.length;
  const avgMembers = totalLeagues > 0 ? (totalMembers / totalLeagues).toFixed(1) : 0;

  console.log(`${colors.bright}🏆 RESUMEN GENERAL DE LIGAS EN JUEGO:${colors.reset}`);
  console.log(`  📁 Total de Ligas creadas:  ${colors.fgCyan}${totalLeagues}${colors.reset}`);
  console.log(`  👥 Total de Integrantes participando: ${colors.fgCyan}${totalMembers}${colors.reset} usuarios`);
  console.log(`  📈 Promedio de Integrantes por Liga:   ${colors.fgYellow}${avgMembers}${colors.reset} participantes/liga\n`);

  // Agrupar miembros por liga
  const membersMap = new Map();
  for (const m of data.members) {
    const list = membersMap.get(m.league_id) || [];
    list.push(m);
    membersMap.set(m.league_id, list);
  }

  const leaguesList = data.leagues.map(l => {
    const leagueMembers = membersMap.get(l.id) || [];
    const withPredictionsCount = leagueMembers.filter(m => m.predictions !== null).length;
    const ownerName = leagueMembers.find(m => m.user_id === l.owner_id)?.name || 'Desconocido';

    return {
      id: l.id,
      nombre: l.name,
      creador: ownerName,
      creadorId: l.owner_id,
      miembrosCount: leagueMembers.length,
      prediccionesCount: withPredictionsCount,
      fechaCreacion: l.created_at,
      miembros: leagueMembers
    };
  });

  if (filterLeagueId) {
    const selected = leaguesList.find(l => l.id === filterLeagueId);
    if (!selected) {
      console.log(`${colors.fgRed}❌ No se encontró ninguna liga con el ID: "${filterLeagueId}"${colors.reset}\n`);
      return;
    }

    console.log(`${colors.bright}${colors.bgBlue} 🔍 DETALLE DE LA LIGA SELECCIONADA: ${selected.nombre.toUpperCase()} ${colors.reset}`);
    console.log(`  🆔 ID de la Liga: ${colors.fgCyan}${selected.id}${colors.reset}`);
    console.log(`  👑 Creador: ${selected.creador} (${selected.creadorId})`);
    console.log(`  📅 Creada el: ${formatShortDate(selected.fechaCreacion)}`);
    console.log(`  👥 Miembros totales: ${colors.bright}${selected.miembrosCount}${colors.reset}`);
    console.log(`  📝 Con pronósticos completados: ${colors.fgGreen}${selected.prediccionesCount}${colors.reset} de ${selected.miembrosCount}\n`);

    console.log(`  ${colors.bright}Integrantes de la liga:${colors.reset}`);
    if (selected.miembros.length === 0) {
      console.log('    ⚠️ Esta liga no tiene integrantes.');
    } else {
      console.table(selected.miembros.map((m, idx) => ({
        '#': idx + 1,
        'Nombre': m.name,
        'ID de Usuario': m.user_id,
        'Se unió el': formatShortDate(m.joined_at),
        'Pronóstico': m.predictions ? '✅ COMPLETADO' : '⏳ PENDIENTE'
      })));
    }
    console.log('');
    return;
  }

  // Vista General de todas las ligas
  console.log(`${colors.bright}📋 LISTADO DE LIGAS EN CURSO:${colors.reset}`);
  if (leaguesList.length === 0) {
    console.log('  ⚠️ No hay ligas registradas actualmente en la base de datos.');
  } else {
    console.table(leaguesList.map(l => ({
      'Nombre de Liga': l.nombre,
      'ID de Liga': l.id.slice(0, 8) + '...',
      'Creador': l.creador,
      'Participantes': l.miembrosCount,
      'Pronósticos Listos': `${l.prediccionesCount}/${l.miembrosCount}`,
      'Fecha Creación': formatShortDate(l.fechaCreacion)
    })));
  }

  console.log(`\n${colors.bright}👥 RESUMEN DETALLADO DE INTEGRANTES POR LIGA:${colors.reset}`);
  if (leaguesList.length === 0) {
    console.log('  ⚠️ Sin ligas ni integrantes.');
  } else {
    for (const league of leaguesList) {
      console.log(`  📍 Liga: ${colors.bright}${colors.fgYellow}${league.nombre}${colors.reset} (${colors.dim}${league.id}${colors.reset})`);
      console.log(`     Creador: ${league.creador} | Miembros: ${league.miembrosCount} | Creada el: ${formatShortDate(league.fechaCreacion)}`);
      
      if (league.miembros.length === 0) {
        console.log(`     ${colors.dim}No hay miembros en esta liga.${colors.reset}`);
      } else {
        const membersListString = league.miembros.map(m => {
          const isOwnerText = m.user_id === league.creadorId ? ` ${colors.fgMagenta}[OWNER]${colors.reset}` : '';
          const hasPredText = m.predictions 
            ? `${colors.fgGreen}✅ Listo${colors.reset}` 
            : `${colors.fgYellow}⏳ Sin pronóstico${colors.reset}`;
          return `       • ${colors.bright}${m.name}${colors.reset}${isOwnerText} (${colors.dim}${m.user_id.slice(0, 8)}...${colors.reset}) - ${hasPredText}`;
        }).join('\n');
        console.log(membersListString);
      }
      console.log(`     ──────────────────────────────────────────────────────────────────`);
    }
  }

  console.log(`\n💡 ${colors.bright}Tip:${colors.reset} Puedes ver más detalles de una sola liga con:`);
  console.log(`  node scripts/supabase-summary.mjs --league <id_de_la_liga>`);
  console.log(`  o exportar todo en formato JSON con:`);
  console.log(`  node scripts/supabase-summary.mjs --json\n`);
}

async function main() {
  try {
    const data = await getSummaryData();
    processAndDisplay(data);
  } catch (err) {
    console.error(`${colors.fgRed}❌ Error inesperado al generar el resumen:${colors.reset}`, err);
  }
}

main();
