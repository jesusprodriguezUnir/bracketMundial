interface MatchModalSaveDetail {
  scoreA: number | null;
  scoreB: number | null;
  penaltyScoreA?: number | null;
  penaltyScoreB?: number | null;
}

type MatchModalElement = HTMLElement & {
  matchId: string;
  teamA: string;
  teamB: string;
  initialScoreA: number | null;
  initialScoreB: number | null;
  initialPenaltyScoreA: number | null;
  initialPenaltyScoreB: number | null;
  phase: 'group' | 'knockout';
  goalScorers?: unknown;
  venue: string;
  city: string;
  timeSpain: string;
  stadiumImage: string;
};

interface OpenMatchModalOptions {
  matchId: string;
  teamA: string;
  teamB: string;
  initialScoreA: number | null;
  initialScoreB: number | null;
  initialPenaltyScoreA?: number | null;
  initialPenaltyScoreB?: number | null;
  phase: 'group' | 'knockout';
  goalScorers?: unknown;
  venue?: string;
  city?: string;
  timeSpain?: string;
  stadiumImage?: string;
  onSave: (detail: MatchModalSaveDetail) => void;
}

export function openMatchModal(options: OpenMatchModalOptions): MatchModalElement {
  const modal = document.createElement('match-modal') as MatchModalElement;
  modal.matchId = options.matchId;
  modal.teamA = options.teamA;
  modal.teamB = options.teamB;
  modal.initialScoreA = options.initialScoreA;
  modal.initialScoreB = options.initialScoreB;
  modal.initialPenaltyScoreA = options.initialPenaltyScoreA ?? null;
  modal.initialPenaltyScoreB = options.initialPenaltyScoreB ?? null;
  modal.phase = options.phase;
  modal.goalScorers = options.goalScorers;
  modal.venue = options.venue ?? '';
  modal.city = options.city ?? '';
  modal.timeSpain = options.timeSpain ?? '';
  modal.stadiumImage = options.stadiumImage ?? '';

  const handleSave = (event: Event) => {
    options.onSave((event as CustomEvent<MatchModalSaveDetail>).detail);
    modal.remove();
  };

  modal.addEventListener('save', handleSave);
  modal.addEventListener('close', () => modal.remove(), { once: true });
  document.body.appendChild(modal);

  return modal;
}