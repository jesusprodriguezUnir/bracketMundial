export interface Predicted11ClubMap {
  code: string;
  ffId: number;
  slug: string;
  name: string;
}

export const UCL_PREDICTED11_CLUBS: Record<string, Predicted11ClubMap> = {
  RMA: { code: 'RMA', ffId: 15, slug: 'real-madrid', name: 'Real Madrid' },
  BAR: { code: 'BAR', ffId: 3, slug: 'barcelona', name: 'Barcelona' },
  ATL: { code: 'ATL', ffId: 2, slug: 'atletico', name: 'Atlético' },
  BET: { code: 'BET', ffId: 4, slug: 'betis', name: 'Betis' },
  VIL: { code: 'VIL', ffId: 22, slug: 'villarreal', name: 'Villarreal' },
  ARS: { code: 'ARS', ffId: 500, slug: 'arsenal', name: 'Arsenal' },
  AVL: { code: 'AVL', ffId: 621, slug: 'aston-villa', name: 'Aston Villa' },
  LIV: { code: 'LIV', ffId: 563, slug: 'liverpool', name: 'Liverpool' },
  MCI: { code: 'MCI', ffId: 516, slug: 'manchester-city', name: 'Man City' },
  MUN: { code: 'MUN', ffId: 517, slug: 'manchester-united', name: 'Man United' },
  BAY: { code: 'BAY', ffId: 503, slug: 'bayern-munich', name: 'Bayern' },
  BVB: { code: 'BVB', ffId: 539, slug: 'borussia-dortmund', name: 'B. Dortmund' },
  VFB: { code: 'VFB', ffId: 766, slug: 'stuttgart', name: 'Stuttgart' },
  RBL: { code: 'RBL', ffId: 576, slug: 'leipzig', name: 'RB Leipzig' },
  INT: { code: 'INT', ffId: 599, slug: 'inter', name: 'Inter' },
  NAP: { code: 'NAP', ffId: 531, slug: 'napoles', name: 'Napoli' },
  ROM: { code: 'ROM', ffId: 523, slug: 'roma', name: 'Roma' },
  COM: { code: 'COM', ffId: 763, slug: 'como', name: 'Como' },
  PSG: { code: 'PSG', ffId: 520, slug: 'paris-saint-germain', name: 'PSG' },
  LIL: { code: 'LIL', ffId: 628, slug: 'lille', name: 'Lille' },
  RCL: { code: 'RCL', ffId: 732, slug: 'lens', name: 'Lens' },
  PSV: { code: 'PSV', ffId: 521, slug: 'psv', name: 'PSV' },
  FEY: { code: 'FEY', ffId: 575, slug: 'feyenoord', name: 'Feyenoord' },
  FCP: { code: 'FCP', ffId: 522, slug: 'porto', name: 'Porto' },
  SPO: { code: 'SPO', ffId: 535, slug: 'sporting-cp', name: 'Sporting CP' },
  GAL: { code: 'GAL', ffId: 509, slug: 'galatasaray', name: 'Galatasaray' },
  FEN: { code: 'FEN', ffId: 681, slug: 'fenerbahce', name: 'Fenerbahçe' },
  BRU: { code: 'BRU', ffId: 536, slug: 'brujas', name: 'Brujas' },
  SLP: { code: 'SLP', ffId: 618, slug: 'slavia-praga', name: 'Slavia Praga' },
  SHK: { code: 'SHK', ffId: 524, slug: 'shakhtar-donetsk', name: 'Shakhtar' },
  AEK: { code: 'AEK', ffId: 611, slug: 'aek-atenas', name: 'AEK' },
  LSK: { code: 'LSK', ffId: 736, slug: 'lask', name: 'LASK' },
  VIK: { code: 'VIK', ffId: 825, slug: 'viking', name: 'Viking' },
  BOD: { code: 'BOD', ffId: 773, slug: 'bodo-glimt', name: 'Bodø/Glimt' },
  SLO: { code: 'SLO', ffId: 765, slug: 'slovan-bratislava', name: 'Slo. Bratislava' },
  SAB: { code: 'SAB', ffId: 826, slug: 'sabah', name: 'Sabah' },
};

export function getPredicted11Club(code: string): Predicted11ClubMap | undefined {
  return UCL_PREDICTED11_CLUBS[code.toUpperCase()];
}

export function findClubByFutbolFantasyName(name: string): Predicted11ClubMap | undefined {
  const norm = name.trim().toLowerCase();
  return Object.values(UCL_PREDICTED11_CLUBS).find(c => {
    const cName = c.name.toLowerCase();
    const cSlug = c.slug.replace(/-/g, ' ').toLowerCase();
    return norm === cName || norm === cSlug || norm.includes(cName) || cName.includes(norm);
  });
}
