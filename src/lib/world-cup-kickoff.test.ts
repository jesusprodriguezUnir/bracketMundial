import { describe, it, expect } from 'vitest';
import { scoreParticipant, rankParticipants, MUNDIAL_POINTS } from './mini-league';
import type { Participant } from './mini-league';

describe('Super Prueba de Integración: Día de Inicio del Mundial 2026', () => {
  // Primer partido del mundial: México (MEX) vs Sudáfrica (RSA)
  const matchId = 'M1';

  // 1. Definimos las predicciones de los participantes en la Liga de Usuarios
  const participantA: Pick<Participant, 'id' | 'name' | 'groupScores' | 'knockoutScores'> = {
    id: 'p-user-a',
    name: 'Sofía (Pronosticó Exacto: 1-0)',
    groupScores: [{ matchId, scoreA: 1, scoreB: 0 }],
    knockoutScores: [],
  };

  const participantB: Pick<Participant, 'id' | 'name' | 'groupScores' | 'knockoutScores'> = {
    id: 'p-user-b',
    name: 'Mateo (Pronosticó Diferencia: 2-1)',
    groupScores: [{ matchId, scoreA: 2, scoreB: 1 }],
    knockoutScores: [],
  };

  const participantC: Pick<Participant, 'id' | 'name' | 'groupScores' | 'knockoutScores'> = {
    id: 'p-user-c',
    name: 'Carlos (Pronosticó Derrota: 0-2)',
    groupScores: [{ matchId, scoreA: 0, scoreB: 2 }],
    knockoutScores: [],
  };

  const participants = [participantA, participantB, participantC];

  it('Escenario 1: Antes de empezar el partido (Marcador Pendiente/Null)', () => {
    // Marcador real en vivo de la FIFA (M1 no ha empezado aún)
    const realScores = [{ matchId, scoreA: null, scoreB: null }];

    // Calculamos el estado de la liga de forma dinámica (equivalente a _recalc() en el frontend)
    const scores = participants.map(p => scoreParticipant(p, realScores, []));
    const ranking = rankParticipants(scores);

    // Todos deberían tener 0 puntos porque el partido está pendiente
    expect(ranking.every(s => s.total === 0)).toBe(true);
    expect(ranking[0].breakdown[0].kind).toBe('pending');
  });

  it('Escenario 2: Empieza el partido y Gol de México! (Marcador en Vivo: 1-0)', () => {
    // Marcador real actualizado en vivo en la base de datos (México 1 - 0 Sudáfrica)
    const realScores = [{ matchId, scoreA: 1, scoreB: 0 }];

    // La UI reacciona al cambio de estado (o se vuelve a calcular en el cliente al recibir el payload)
    const scores = participants.map(p => scoreParticipant(p, realScores, []));
    const ranking = rankParticipants(scores);

    // Encontrar los resultados de cada uno de los participantes
    const resultA = scores.find(s => s.participant.id === 'p-user-a')!;
    const resultB = scores.find(s => s.participant.id === 'p-user-b')!;
    const resultC = scores.find(s => s.participant.id === 'p-user-c')!;

    // Sofía tiene el resultado exacto (1-0) -> 5 puntos (MUNDIAL_POINTS.groupExact)
    expect(resultA.total).toBe(MUNDIAL_POINTS.groupExact); // 5 puntos
    expect(resultA.breakdown[0].kind).toBe('exact');

    // Mateo pronosticó 2-1 (Misma diferencia de +1 gol) -> 3 puntos (MUNDIAL_POINTS.groupDiff)
    expect(resultB.total).toBe(MUNDIAL_POINTS.groupDiff); // 3 puntos
    expect(resultB.breakdown[0].kind).toBe('diff');

    // Carlos pronosticó 0-2 (Error completo) -> 0 puntos (MUNDIAL_POINTS.groupMiss)
    expect(resultC.total).toBe(MUNDIAL_POINTS.groupMiss); // 0 puntos
    expect(resultC.breakdown[0].kind).toBe('miss');

    // El ranking se actualiza automáticamente según la puntuación en vivo
    expect(ranking[0].participant.name).toContain('Sofía');
    expect(ranking[1].participant.name).toContain('Mateo');
    expect(ranking[2].participant.name).toContain('Carlos');
  });
});
