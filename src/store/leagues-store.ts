import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { ExcelService, ExcelImportError } from '../lib/excel-service';
import { GROUP_MATCHES } from '../data/match-schedule';
import { getKnockoutMatchOrder } from './tournament-store';
import type { DecodedBracket } from '../lib/bracket-codec';

export interface LeagueParticipant {
  id: string;
  name: string;
  addedAt: number;
  source: 'manual' | 'excel';
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
  isOwner?: boolean;
}

export interface League {
  id: string;
  name: string;
  createdAt: number;
  participants: LeagueParticipant[];
  rankingSnapshot?: Array<{ participantId: string; position: number }>;
  rankingSnapshotMatchCount?: number;
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

  createLeague: (name: string) => string;
  renameLeague: (id: string, name: string) => void;
  deleteLeague: (id: string) => void;
  setActiveLeague: (id: string | null) => void;

  addParticipantFromExcel: (leagueId: string, name: string, file: File) => Promise<boolean>;
  addEmptyParticipant: (leagueId: string, name: string) => string;
  replaceParticipantFromExcel: (leagueId: string, participantId: string, file: File) => Promise<boolean>;
  removeParticipant: (leagueId: string, participantId: string) => void;
  renameParticipant: (leagueId: string, participantId: string, name: string) => void;
  updateParticipantScores: (
    leagueId: string,
    participantId: string,
    groupScores: DecodedBracket['groupScores'],
    knockoutScores: DecodedBracket['knockoutScores'],
  ) => void;
  updateRankingSnapshot: (leagueId: string, snapshot: Array<{ participantId: string; position: number }>, matchCount: number) => void;
}

export const useLeaguesStore = createStore<LeaguesState>()(
  persist(
    (set, get) => ({
      leagues: [],
      activeLeagueId: null,

      createLeague: (name) => {
        const id = generateLid();
        const league: League = {
          id,
          name: name.trim(),
          createdAt: Date.now(),
          participants: [
            {
              id: generatePid(),
              name: 'Me',
              addedAt: Date.now(),
              source: 'manual',
              groupScores: createEmptyGroupScores(),
              knockoutScores: createEmptyKnockoutScores(),
              isOwner: true,
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

      updateParticipantScores: (leagueId, participantId, groupScores, knockoutScores) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? {
                  ...l,
                  participants: l.participants.map(p =>
                    p.id === participantId
                      ? { ...p, groupScores, knockoutScores }
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

      updateRankingSnapshot: (leagueId, snapshot, matchCount) => {
        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? { ...l, rankingSnapshot: snapshot, rankingSnapshotMatchCount: matchCount }
              : l,
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
