import { describe, it, expect } from 'vitest';
import { ExcelService } from './excel-service';
import type { GroupMatchResult, KnockoutMatchResult } from '../store/tournament-store';

// Minimal group matches for Group A (6 matches, 4 teams)
function makeGroupMatches(): GroupMatchResult[] {
  const pairs: [string, string][] = [
    ['MEX', 'RSA'], ['KOR', 'CZE'],
    ['MEX', 'KOR'], ['RSA', 'CZE'],
    ['MEX', 'CZE'], ['RSA', 'KOR'],
  ];
  return pairs.map(([teamA, teamB], i) => ({
    matchId: `M${i + 1}`,
    group: 'A',
    teamA,
    teamB,
    scoreA: i === 0 ? 2 : null,
    scoreB: i === 0 ? 1 : null,
    matchDay: Math.floor(i / 2) + 1,
  }));
}

function makeKnockoutMatches(): Record<string, KnockoutMatchResult> {
  return {
    'R32-01': {
      matchId: 'R32-01',
      round: 'roundOf32',
      teamA: 'MEX',
      teamB: 'RSA',
      scoreA: 3,
      scoreB: 2,
      penaltyScoreA: null,
      penaltyScoreB: null,
      winnerId: 'MEX',
      isPlayed: true,
    },
    'R32-02': {
      matchId: 'R32-02',
      round: 'roundOf32',
      teamA: 'BRA',
      teamB: 'ARG',
      scoreA: 1,
      scoreB: 1,
      penaltyScoreA: 4,
      penaltyScoreB: 5,
      winnerId: 'ARG',
      isPlayed: true,
    },
  };
}

describe('ExcelService round-trip', () => {
  it('exports and imports group scores correctly', async () => {
    const groupMatches = makeGroupMatches();
    const blob = await ExcelService.exportToExcel(groupMatches, {});
    const buffer = await blob.arrayBuffer();
    const result = await ExcelService.importFromBuffer(buffer);

    // Match M1 has score 2-1
    const m1 = result.groupScores.find(s => s.matchId === 'M1');
    expect(m1?.scoreA).toBe(2);
    expect(m1?.scoreB).toBe(1);

    // Other matches have null scores
    const m2 = result.groupScores.find(s => s.matchId === 'M2');
    expect(m2?.scoreA).toBeNull();
    expect(m2?.scoreB).toBeNull();

    // All 6 group matches are present
    expect(result.groupScores).toHaveLength(6);
  });

  it('exports and imports knockout scores including penalties', async () => {
    const knockoutMatches = makeKnockoutMatches();
    // Need full match list for group sheet; pass empty array for groups
    const blob = await ExcelService.exportToExcel([], knockoutMatches);
    const buffer = await blob.arrayBuffer();
    const result = await ExcelService.importFromBuffer(buffer);

    // R32-01: regular score, no penalties
    const r32_01 = result.knockoutScores.find(s => s.matchId === 'R32-01');
    expect(r32_01?.scoreA).toBe(3);
    expect(r32_01?.scoreB).toBe(2);
    expect(r32_01?.penaltyScoreA).toBeNull();
    expect(r32_01?.penaltyScoreB).toBeNull();

    // R32-02: draw with penalties
    const r32_02 = result.knockoutScores.find(s => s.matchId === 'R32-02');
    expect(r32_02?.scoreA).toBe(1);
    expect(r32_02?.scoreB).toBe(1);
    expect(r32_02?.penaltyScoreA).toBe(4);
    expect(r32_02?.penaltyScoreB).toBe(5);
  });

  it('workbook contains required sheets', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const blob = await ExcelService.exportToExcel(makeGroupMatches(), makeKnockoutMatches());
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const names = wb.worksheets.map(ws => ws.name);
    expect(names).toContain('Fase de Grupos');
    expect(names).toContain('Eliminatorias');
    expect(names).toContain('CALC');
    expect(names).toContain('MAP');
  });

  it('MAP sheet has entries for all exported matches', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const groupMatches = makeGroupMatches();
    const blob = await ExcelService.exportToExcel(groupMatches, {});
    const buffer = await blob.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const mapSheet = wb.getWorksheet('MAP');
    expect(mapSheet).toBeDefined();

    const matchIds: string[] = [];
    mapSheet!.eachRow((row, n) => {
      if (n === 1) return;
      const id = row.getCell(1).value?.toString();
      if (id) matchIds.push(id);
    });

    // All 6 group match IDs should appear
    groupMatches.forEach(m => {
      expect(matchIds).toContain(m.matchId);
    });
  });

  it('importFromBuffer throws on invalid file', async () => {
    await expect(
      ExcelService.importFromBuffer(new ArrayBuffer(0))
    ).rejects.toThrow();
  });
});
