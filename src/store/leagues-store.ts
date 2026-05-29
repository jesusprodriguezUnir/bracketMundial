import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { ExcelService, ExcelImportError } from '../lib/excel-service';
import { GROUP_MATCHES } from '../data/match-schedule';
import { getKnockoutMatchOrder } from './tournament-store';
import type { DecodedBracket } from '../lib/bracket-codec';
import { useAuthStore } from './auth-store';

export interface LeagueParticipant {
  id: string;
  name: string;
  addedAt: number;
  source: 'manual' | 'excel';
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
  isOwner?: boolean;
  userId?: string;
  topScorer?: DecodedBracket['topScorer'];
  mvp?: DecodedBracket['mvp'];
}

export interface League {
  id: string;
  name: string;
  createdAt: number;
  participants: LeagueParticipant[];
}

let idCounter = 0;

function generatePid(): string {
  idCounter++;
  return `p-${Date.now()}-${idCounter}`;
}

function generateLid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `l-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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

interface LeaguesState {
  leagues: League[];
  activeLeagueId: string | null;

  createLeague: (name: string, ownerName?: string) => string;
  renameLeague: (id: string, name: string) => void;
  deleteLeague: (id: string) => void;
  setActiveLeague: (id: string | null) => void;

  addParticipantFromExcel: (leagueId: string, name: string, file: File) => Promise<boolean>;
  addEmptyParticipant: (leagueId: string, name: string) => string;
  joinLeagueFromInvite: (leagueId: string, name: string, participantName: string) => string;
  importParticipantFromShare: (
    leagueId: string,
    participantName: string,
    groupScores: DecodedBracket['groupScores'],
    knockoutScores: DecodedBracket['knockoutScores'],
    topScorer?: DecodedBracket['topScorer'],
    mvp?: DecodedBracket['mvp'],
  ) => { created: boolean; participantId: string };
  replaceParticipantFromExcel: (leagueId: string, participantId: string, file: File) => Promise<boolean>;
  removeParticipant: (leagueId: string, participantId: string) => void;
  renameParticipant: (leagueId: string, participantId: string, name: string) => void;
  updateParticipantScores: (
    leagueId: string,
    participantId: string,
    groupScores: DecodedBracket['groupScores'],
    knockoutScores: DecodedBracket['knockoutScores'],
    topScorer?: DecodedBracket['topScorer'],
    mvp?: DecodedBracket['mvp'],
  ) => void;

  _addLeague: (league: League) => void;
  _patchLeague: (id: string, partial: Partial<Omit<League, 'id' | 'participants'>> & { participants?: League['participants'] }) => void;
}

export const useLeaguesStore = createStore<LeaguesState>()(
  persist(
    (set, get) => ({
      leagues: [],
      activeLeagueId: null,

      createLeague: (name, ownerName) => {
        const id = generateLid();
        const cleanedOwnerName = (ownerName ?? '').trim() || 'Me';
        const userId = useAuthStore.getState().session?.user.id;
        const pid = userId || generatePid();
        const league: League = {
          id,
          name: name.trim(),
          createdAt: Date.now(),
          participants: [
            {
              id: pid,
              name: cleanedOwnerName,
              addedAt: Date.now(),
              source: 'manual',
              groupScores: createEmptyGroupScores(),
              knockoutScores: createEmptyKnockoutScores(),
              isOwner: true,
              userId,
            },
          ],
        };
        set({ leagues: [...get().leagues, league], activeLeagueId: id });
        return id;
      },

      renameLeague: (id, name) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === id ? { ...l, name } : l,
          ),
        });
      },

      deleteLeague: (id) => {
        set({
          leagues: get().leagues.filter(l => l.id !== id),
          activeLeagueId: get().activeLeagueId === id ? null : get().activeLeagueId,
        });
      },

      setActiveLeague: (id) => set({ activeLeagueId: id }),

      addParticipantFromExcel: async (leagueId, name, file) => {
        try {
          const { groupScores, knockoutScores } = await ExcelService.importFromExcel(file);
          if (groupScores.length === 0 && knockoutScores.length === 0) return false;

          const participant: LeagueParticipant = {
            id: generatePid(),
            name: name.trim(),
            addedAt: Date.now(),
            source: 'excel',
            groupScores,
            knockoutScores,
          };

          set({
            leagues: get().leagues.map(l =>
              l.id === leagueId
                ? { ...l, participants: [...l.participants, participant] }
                : l,
            ),
          });
          return true;
        } catch (e) {
          if (e instanceof ExcelImportError) return false;
          return false;
        }
      },

      addEmptyParticipant: (leagueId, name) => {
        const participant: LeagueParticipant = {
          id: generatePid(),
          name: name.trim(),
          addedAt: Date.now(),
          source: 'manual',
          groupScores: createEmptyGroupScores(),
          knockoutScores: createEmptyKnockoutScores(),
        };

        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? { ...l, participants: [...l.participants, participant] }
              : l,
          ),
        });
        return participant.id;
      },

      joinLeagueFromInvite: (leagueId, name, participantName) => {
        const existing = get().leagues.find(l => l.id === leagueId);
        const userId = useAuthStore.getState().session?.user.id;

        if (existing) {
          const already = existing.participants.find(p => (userId && p.userId === userId) || p.isOwner);
          if (already) {
            return already.id;
          }

          const pid = userId || generatePid();
          const participant: LeagueParticipant = {
            id: pid,
            name: participantName.trim(),
            addedAt: Date.now(),
            source: 'manual',
            groupScores: createEmptyGroupScores(),
            knockoutScores: createEmptyKnockoutScores(),
            userId,
          };
          set({
            leagues: get().leagues.map(l =>
              l.id === leagueId
                ? { ...l, participants: [...l.participants, participant] }
                : l,
            ),
            activeLeagueId: leagueId,
          });
          return pid;
        }

        const pid = userId || generatePid();
        const league: League = {
          id: leagueId,
          name: name.trim(),
          createdAt: Date.now(),
          participants: [
            {
              id: pid,
              name: participantName.trim(),
              addedAt: Date.now(),
              source: 'manual',
              groupScores: createEmptyGroupScores(),
              knockoutScores: createEmptyKnockoutScores(),
              isOwner: true,
              userId,
            },
          ],
        };
        set({ leagues: [...get().leagues, league], activeLeagueId: leagueId });
        return pid;
      },

      importParticipantFromShare: (leagueId, participantName, groupScores, knockoutScores, topScorer, mvp) => {
        const leagues = get().leagues;
        const league = leagues.find(l => l.id === leagueId);

        if (!league) return { created: false, participantId: '' };

        const existingP = league.participants.find(
          p => p.name.toLowerCase() === participantName.toLowerCase(),
        );

        if (existingP) {
          set({
            leagues: leagues.map(l =>
              l.id === leagueId
                ? {
                    ...l,
                    participants: l.participants.map(p =>
                      p.id === existingP.id
                        ? { ...p, groupScores, knockoutScores, topScorer, mvp }
                        : p,
                    ),
                  }
                : l,
            ),
          });
          return { created: false, participantId: existingP.id };
        }

        const participant: LeagueParticipant = {
          id: generatePid(),
          name: participantName.trim(),
          addedAt: Date.now(),
          source: 'manual',
          groupScores,
          knockoutScores,
          topScorer,
          mvp,
        };

        set({
          leagues: leagues.map(l =>
            l.id === leagueId
              ? { ...l, participants: [...l.participants, participant] }
              : l,
          ),
          activeLeagueId: leagueId,
        });
        return { created: true, participantId: participant.id };
      },

      replaceParticipantFromExcel: async (leagueId, participantId, file) => {
        try {
          const { groupScores, knockoutScores } = await ExcelService.importFromExcel(file);
          if (groupScores.length === 0 && knockoutScores.length === 0) return false;

          set({
            leagues: get().leagues.map(l =>
              l.id === leagueId
                ? {
                    ...l,
                    participants: l.participants.map(p =>
                      p.id === participantId
                        ? { ...p, groupScores, knockoutScores, source: 'excel' as const }
                        : p,
                    ),
                  }
                : l,
            ),
          });
          return true;
        } catch (e) {
          if (e instanceof ExcelImportError) return false;
          return false;
        }
      },

      updateParticipantScores: (leagueId, participantId, groupScores, knockoutScores, topScorer, mvp) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? {
                  ...l,
                  participants: l.participants.map(p =>
                    p.id === participantId
                      ? {
                          ...p,
                          groupScores,
                          knockoutScores,
                          topScorer: topScorer !== undefined ? topScorer : p.topScorer,
                          mvp: mvp !== undefined ? mvp : p.mvp,
                        }
                      : p,
                  ),
                }
              : l,
          ),
        });
      },

      removeParticipant: (leagueId, participantId) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? { ...l, participants: l.participants.filter(p => p.id !== participantId) }
              : l,
          ),
        });
      },

      renameParticipant: (leagueId, participantId, name) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? {
                  ...l,
                  participants: l.participants.map(p =>
                    p.id === participantId ? { ...p, name } : p,
                  ),
                }
              : l,
          ),
        });
      },

      _addLeague: (league) => {
        set({
          leagues: [...get().leagues.filter(l => l.id !== league.id), league],
        });
      },

      _patchLeague: (id, partial) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === id ? { ...l, ...partial } : l,
          ),
        });
      },

    }),
    {
      name: 'mundial-2026-leagues',
      version: 1,
      migrate: (persisted: unknown) => {
        const p = persisted as { leagues?: League[] };
        if (p.leagues) {
          p.leagues = p.leagues.map(l => ({
            ...l,
            participants: l.participants.map((participant, i) =>
              i === 0 ? { ...participant, isOwner: true } : participant,
            ),
          }));
        }
        return p as Record<string, unknown>;
      },
    },
  ),
);
