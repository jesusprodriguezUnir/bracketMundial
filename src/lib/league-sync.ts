import { useLeaguesStore, findMyParticipant, type League, type LeagueParticipant } from '../store/leagues-store';
import { useAuthStore } from '../store/auth-store';
import { getSupabase } from './supabase-client';
import { GROUP_MATCHES } from '../data/match-schedule';
import { getKnockoutMatchOrder } from '../store/tournament-store';
import type { DecodedBracket } from './bracket-codec';

// ── Helpers ──

function createEmptyGroupScores(): DecodedBracket['groupScores'] {
  return GROUP_MATCHES.map(m => ({
    matchId: m.matchId,
    scoreA: null as number | null,
    scoreB: null as number | null,
  }));
}

function createEmptyKnockoutScores(): DecodedBracket['knockoutScores'] {
  return getKnockoutMatchOrder().map(matchId => ({
    matchId,
    scoreA: null as number | null,
    scoreB: null as number | null,
    penaltyScoreA: null as number | null,
    penaltyScoreB: null as number | null,
  }));
}

export function predictionsToJson(
  groupScores: DecodedBracket['groupScores'],
  knockoutScores: DecodedBracket['knockoutScores'],
  topScorer?: DecodedBracket['topScorer'],
  mvp?: DecodedBracket['mvp']
) {
  return { groupScores, knockoutScores, topScorer, mvp };
}

export function jsonToPredictions(json: unknown): {
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
  topScorer: DecodedBracket['topScorer'] | null;
  mvp: DecodedBracket['mvp'] | null;
} | null {
  if (!json || typeof json !== 'object') return null;
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.groupScores) || !Array.isArray(obj.knockoutScores)) return null;
  return {
    groupScores: obj.groupScores as DecodedBracket['groupScores'],
    knockoutScores: obj.knockoutScores as DecodedBracket['knockoutScores'],
    topScorer: (obj.topScorer as DecodedBracket['topScorer']) ?? null,
    mvp: (obj.mvp as DecodedBracket['mvp']) ?? null,
  };
}

// ── Cloud ↔ Local mapping ──

interface SupabaseLeague {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  join_code: string | null;
}

// ── Helpers de join_code ──

/** Alfabeto seguro: A-Z0-9 sin 0, O, 1, I (se confunden visualmente). */
const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Genera un código aleatorio con formato XXX-XXXX. */
export function generateJoinCode(): string {
  const pick = () => JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  const head = Array.from({ length: 3 }, pick).join('');
  const tail = Array.from({ length: 4 }, pick).join('');
  return `${head}-${tail}`;
}

interface SupabaseMember {
  id: string;
  league_id: string;
  user_id: string;
  name: string;
  predictions: unknown;
  joined_at: string;
}

// ── Operations ──

export async function createLeagueInCloud(
  name: string,
  ownerName: string,
  id?: string,
): Promise<{ id: string; joinCode: string } | null> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) return null;

  const leagueId = id ?? crypto.randomUUID();

  // Intentar hasta 2 veces ante colisión de join_code (muy improbable)
  let joinCode = generateJoinCode();
  let leagueErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    ({ error: leagueErr } = await sb.from('leagues').insert({
      id: leagueId,
      name,
      owner_id: userId,
      join_code: joinCode,
    }));
    if (!leagueErr) break;
    // Código duplicado: reintentar con uno nuevo
    if (leagueErr.code === '23505') {
      joinCode = generateJoinCode();
      continue;
    }
    return null;
  }
  if (leagueErr) return null;

  const { error: memberErr } = await sb.from('league_members').insert({
    league_id: leagueId,
    user_id: userId,
    name: ownerName.trim() || 'Yo',
    predictions: null,
  });

  if (memberErr) {
    await sb.from('leagues').delete().eq('id', leagueId);
    return null;
  }

  return { id: leagueId, joinCode };
}

/** Busca una liga por su join_code en la nube usando la RPC SECURITY DEFINER.
 *  Devuelve { id, name } si existe, null si no o si hay error de red. */
export async function findLeagueByCode(
  code: string,
): Promise<{ id: string; name: string } | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized.length < 6) return null;
  const formatted = `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}`;

  const { data, error } = await sb.rpc('find_league_by_code', { _code: formatted });
  if (error || !data || (data as Array<{ id: string; name: string }>).length === 0) {
    if (error) console.warn('[league-sync] findLeagueByCode error:', error.message);
    return null;
  }
  const row = (data as Array<{ id: string; name: string }>)[0];
  return { id: row.id, name: row.name };
}

export async function deleteLeagueFromCloud(leagueId: string): Promise<boolean> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) return false;

  const { error } = await sb.from('leagues').delete().eq('id', leagueId).eq('owner_id', userId);
  return !error;
}

export async function joinLeagueInCloud(leagueId: string, participantName: string): Promise<boolean> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) {
    console.warn('[league-sync] joinLeagueInCloud: sin sesión, no se puede unir a la liga', leagueId);
    return false;
  }

  const { error } = await sb.from('league_members').upsert(
    { league_id: leagueId, user_id: userId, name: participantName },
    { onConflict: 'league_id, user_id', ignoreDuplicates: false },
  );

  if (error) {
    console.error('[league-sync] joinLeagueInCloud error:', error.code, error.message);
  }
  return !error;
}

/** Obtiene el nombre de una liga desde la nube. Devuelve null si no se puede. */
export async function fetchLeagueNameFromCloud(leagueId: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('leagues')
    .select('name')
    .eq('id', leagueId)
    .single();
  if (error || !data) {
    console.warn('[league-sync] fetchLeagueNameFromCloud error:', error?.message);
    return null;
  }
  return (data as { name: string }).name ?? null;
}

export async function leaveLeagueInCloud(leagueId: string): Promise<boolean> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) return false;

  const { error } = await sb.from('league_members')
    .delete()
    .eq('league_id', leagueId)
    .eq('user_id', userId);

  return !error;
}

export async function updateMyPredictionsInCloud(
  leagueId: string,
  groupScores: DecodedBracket['groupScores'],
  knockoutScores: DecodedBracket['knockoutScores'],
  topScorer?: DecodedBracket['topScorer'],
  mvp?: DecodedBracket['mvp'],
): Promise<boolean> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) return false;

  const { error } = await sb.from('league_members')
    .update({ predictions: predictionsToJson(groupScores, knockoutScores, topScorer, mvp) })
    .eq('league_id', leagueId)
    .eq('user_id', userId);

  if (!error) {
    const leaguesStore = useLeaguesStore.getState();
    const league = leaguesStore.leagues.find(l => l.id === leagueId);
    const me = findMyParticipant(league, userId);
    if (me) {
      leaguesStore.updateParticipantScores(
        leagueId,
        me.id,
        groupScores,
        knockoutScores,
        topScorer,
        mvp
      );
    }
  }

  return !error;
}

export async function updateMyNameInCloud(leagueId: string, name: string): Promise<boolean> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) return false;

  const { error } = await sb.from('league_members')
    .update({ name })
    .eq('league_id', leagueId)
    .eq('user_id', userId);

  return !error;
}

// ── Hydration (sign-in) ──

export async function onSignedIn(): Promise<void> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) {
    console.log('[league-sync] onSignedIn: sin sesión, omitiendo');
    return;
  }

  console.log(`[league-sync] onSignedIn: cargando ligas para user ${userId}`);

  const { data: memberships, error: memErr } = await sb
    .from('league_members')
    .select('league_id')
    .eq('user_id', userId);

  if (memErr) {
    console.error('[league-sync] error al cargar memberships:', memErr);
    return;
  }

  if (!memberships || memberships.length === 0) {
    console.log('[league-sync] onSignedIn: no hay ligas en la nube');
    return;
  }

  const leagueIds = memberships.map((m: { league_id: string }) => m.league_id);
  console.log(`[league-sync] onSignedIn: encontradas ${leagueIds.length} ligas en la nube`);

  const { data: cloudLeagues, error: leagueErr } = await sb
    .from('leagues')
    .select('*')
    .in('id', leagueIds);

  if (leagueErr) {
    console.error('[league-sync] error al cargar ligas:', leagueErr);
    return;
  }

  const { data: cloudMembers, error: membersErr } = await sb
    .from('league_members')
    .select('*')
    .in('league_id', leagueIds);

  if (membersErr) {
    console.error('[league-sync] error al cargar miembros:', membersErr);
    return;
  }

  console.log(`[league-sync] onSignedIn: ${cloudMembers?.length ?? 0} miembros cargados`);
  adoptLocalLeagues(userId);
  hydrateStore(cloudLeagues as SupabaseLeague[], cloudMembers as SupabaseMember[], userId);
}

export async function forcePushAll(): Promise<{ ok: boolean; count: number; userId: string | null }> {
  const userId = useAuthStore.getState().session?.user.id ?? null;
  if (!userId) return { ok: false, count: 0, userId: null };
  adoptLocalLeagues(userId);

  const sb = getSupabase();
  if (!sb) return { ok: false, count: 0, userId };

  const store = useLeaguesStore.getState();
  const myLeagues = store.leagues.filter(l =>
    l.participants.some(p => p.userId === userId || p.isOwner),
  );

  let count = 0;
  for (const league of myLeagues) {
    const me = league.participants.find(p => p.userId === userId || p.isOwner);
    if (!me) continue;

    const hasPredictions = me.groupScores.some(s => s.scoreA !== null)
      || me.knockoutScores.some(s => s.scoreA !== null)
      || !!me.topScorer
      || !!me.mvp;

    try {
      // Incluir join_code solo si la liga local ya lo tiene (no generarlo aquí
      // para no pisar el persistido en la nube). Si la liga se creó offline y
      // no tiene código, asignarle uno nuevo al subirla por primera vez.
      const joinCodePayload = league.joinCode
        ? { join_code: league.joinCode }
        : { join_code: generateJoinCode() };
      await sb.from('leagues').upsert(
        { id: league.id, name: league.name, owner_id: userId, ...joinCodePayload },
        { onConflict: 'id', ignoreDuplicates: false },
      );

      await sb.from('league_members').upsert(
        {
          league_id: league.id,
          user_id: userId,
          name: me.name,
          predictions: hasPredictions
            ? predictionsToJson(me.groupScores, me.knockoutScores, me.topScorer, me.mvp)
            : null,
        },
        { onConflict: 'league_id, user_id' },
      );
      count++;
    } catch (err) {
      console.error('[league-sync] error en forcePushAll:', err);
    }
  }

  return { ok: true, count, userId };
}

function adoptLocalLeagues(userId: string): void {
  const store = useLeaguesStore.getState();
  for (const league of store.leagues) {
    const anyUserId = league.participants.some(p => p.userId);
    if (anyUserId) continue;
    const ownerIdx = league.participants.findIndex(p => p.isOwner);
    if (ownerIdx === -1) continue;
    const patched = league.participants.map((p, idx) =>
      idx === ownerIdx ? { ...p, userId } : p,
    );
    store._patchLeague(league.id, { participants: patched });
    console.log(`[league-sync] adopt local league ${league.id} → owner ${userId}`);
  }
}

function hydrateStore(
  cloudLeagues: SupabaseLeague[],
  cloudMembers: SupabaseMember[],
  myUserId: string | null,
) {
  const store = useLeaguesStore.getState();
  const localLeagues = store.leagues;

  const membersByLeague = new Map<string, SupabaseMember[]>();
  for (const m of cloudMembers) {
    const list = membersByLeague.get(m.league_id) || [];
    list.push(m);
    membersByLeague.set(m.league_id, list);
  }

  for (const cl of cloudLeagues) {
    const members = membersByLeague.get(cl.id) || [];
    const participants: LeagueParticipant[] = members.map(m => {
      const preds = jsonToPredictions(m.predictions);
      return {
        id: m.user_id,
        name: m.name,
        addedAt: new Date(m.joined_at).getTime(),
        source: 'manual' as const,
        groupScores: preds?.groupScores ?? createEmptyGroupScores(),
        knockoutScores: preds?.knockoutScores ?? createEmptyKnockoutScores(),
        isOwner: cl.owner_id === m.user_id,
        userId: m.user_id,
        topScorer: preds?.topScorer ?? null,
        mvp: preds?.mvp ?? null,
      };
    });

    const existingLocal = localLeagues.find(l => l.id === cl.id);
    if (existingLocal) {
      // Para mi participante: conservar predicciones locales si ya tiene alguna.
      const mergedParticipants = mergeParticipants(existingLocal.participants, participants, myUserId);
      const patch: Partial<League> & { participants: typeof participants } = { participants: mergedParticipants };
      // Persistir join_code si la nube lo tiene y el local no
      if (cl.join_code && !existingLocal.joinCode) {
        patch.joinCode = cl.join_code;
      }
      store._patchLeague(cl.id, patch);
    } else {
      const league: League = {
        id: cl.id,
        name: cl.name,
        createdAt: new Date(cl.created_at).getTime(),
        participants,
        ...(cl.join_code ? { joinCode: cl.join_code } : {}),
      };
      store._addLeague(league);
    }
  }
}

function _hasPredictions(p: LeagueParticipant): boolean {
  return (
    p.groupScores.some(s => s.scoreA !== null) ||
    p.knockoutScores.some(s => s.scoreA !== null) ||
    !!p.topScorer ||
    !!p.mvp
  );
}

/**
 * Mezcla participantes locales y de la nube.
 * Para el participante propio (myUserId), si el local ya tiene predicciones,
 * se conservan las locales — la nube no pisa cambios sin publicar.
 * Para el resto de participantes, la nube siempre prevalece.
 */
function mergeParticipants(
  local: LeagueParticipant[],
  cloud: LeagueParticipant[],
  myUserId: string | null,
): LeagueParticipant[] {
  const merged = new Map<string, LeagueParticipant>();
  for (const p of local) {
    const key = p.userId || p.id;
    merged.set(key, p);
  }
  for (const p of cloud) {
    const key = p.userId || p.id;
    const existing = merged.get(key);
    if (existing) {
      const isMe =
        myUserId != null &&
        (p.userId === myUserId || existing.userId === myUserId || existing.isOwner);
      const keepLocalPredictions = isMe && _hasPredictions(existing);
      merged.set(key, {
        ...existing,
        ...p,
        // Si soy yo y tengo predicciones locales, no dejar que la nube las pise.
        ...(keepLocalPredictions
          ? {
              groupScores: existing.groupScores,
              knockoutScores: existing.knockoutScores,
              topScorer: existing.topScorer,
              mvp: existing.mvp,
            }
          : {}),
        isOwner: existing.isOwner || p.isOwner,
        userId: existing.userId || p.userId,
        id: p.id || existing.id,
      });
    } else {
      merged.set(key, p);
    }
  }
  return [...merged.values()];
}

// ── Manual refresh ──

export async function refreshLeagueMembers(leagueId: string): Promise<void> {
  const sb = getSupabase();
  const userId = useAuthStore.getState().session?.user.id;
  if (!sb || !userId) {
    console.log('[league-sync] refresh: sin sesión');
    return;
  }

  const { data: members, error } = await sb
    .from('league_members')
    .select('*')
    .eq('league_id', leagueId);

  if (error) {
    console.error('[league-sync] refresh error:', error);
    return;
  }
  if (!members || members.length === 0) {
    console.log('[league-sync] refresh: 0 miembros encontrados');
    return;
  }

  console.log(`[league-sync] refresh: ${members.length} miembros cargados para liga ${leagueId}`);

  const store = useLeaguesStore.getState();
  const league = store.leagues.find(l => l.id === leagueId);
  if (!league) return;

  let ownerId = '';
  const { data: leagueData } = await sb
    .from('leagues')
    .select('owner_id')
    .eq('id', leagueId)
    .maybeSingle();
  if (leagueData) ownerId = (leagueData as { owner_id: string }).owner_id;

  const cloudParticipants: LeagueParticipant[] = (members as SupabaseMember[]).map(m => {
    const preds = jsonToPredictions(m.predictions);
    return {
      id: m.user_id,
      name: m.name,
      addedAt: new Date(m.joined_at).getTime(),
      source: 'manual' as const,
      groupScores: preds?.groupScores ?? createEmptyGroupScores(),
      knockoutScores: preds?.knockoutScores ?? createEmptyKnockoutScores(),
      isOwner: ownerId === m.user_id,
      userId: m.user_id,
      topScorer: preds?.topScorer ?? null,
      mvp: preds?.mvp ?? null,
    };
  });

  // Mezclar protegiendo predicciones locales propias sin publicar.
  const merged = mergeParticipants(league.participants, cloudParticipants, userId);
  store._patchLeague(leagueId, { participants: merged });
}
