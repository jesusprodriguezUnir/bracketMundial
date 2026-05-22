import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { decodeSharedPayload, type DecodedBracket } from '../lib/bracket-codec';
import { ExcelService, ExcelImportError } from '../lib/excel-service';

export interface LeagueParticipant {
  id: string;
  name: string;
  addedAt: number;
  source: 'link' | 'excel';
  groupScores: DecodedBracket['groupScores'];
  knockoutScores: DecodedBracket['knockoutScores'];
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

interface LeaguesState {
  leagues: League[];
  activeLeagueId: string | null;

  createLeague: (name: string) => string;
  renameLeague: (id: string, name: string) => void;
  deleteLeague: (id: string) => void;
  setActiveLeague: (id: string | null) => void;

  addParticipantFromUrl: (leagueId: string, name: string, url: string) => boolean;
  addParticipantFromExcel: (leagueId: string, name: string, file: File) => Promise<boolean>;
  replaceParticipantFromExcel: (leagueId: string, participantId: string, file: File) => Promise<boolean>;
  removeParticipant: (leagueId: string, participantId: string) => void;
  renameParticipant: (leagueId: string, participantId: string, name: string) => void;
  updateParticipantScores: (
    leagueId: string,
    participantId: string,
    groupScores: DecodedBracket['groupScores'],
    knockoutScores: DecodedBracket['knockoutScores'],
  ) => void;
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
          participants: [],
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

      addParticipantFromUrl: (leagueId, name, url) => {
        const bracket = decodeSharedPayload(url);
        if (!bracket) return false;

        const participant: LeagueParticipant = {
          id: generatePid(),
          name: name.trim(),
          addedAt: Date.now(),
          source: 'link',
          groupScores: bracket.groupScores,
          knockoutScores: bracket.knockoutScores,
        };

        set({
          leagues: get().leagues.map(l =>
            l.id === leagueId
              ? { ...l, participants: [...l.participants, participant] }
              : l,
          ),
        });
        return true;
      },

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
    }),
    {
      name: 'mundial-2026-leagues',
    },
  ),
);
