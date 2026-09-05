// Coach data for teams and clubs.
// Indexed by team code (uppercase, same key as SQUADS/LINEUPS).

export interface Coach {
  name: string;
  born: string;        // YYYY-MM-DD — age is computed at runtime
  nationality: string;
  photoUrl?: string;
  bio: { es: string; en: string };
}

export const COACHES: Record<string, Coach> = {
  AEK: {
    name: 'Marko Nikolić',
    born: '1975-01-01',
    nationality: 'SRB',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250016266.jpg',
    bio: {
      es: 'Director técnico de PAE AEK. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of PAE AEK. Competing in the UEFA Champions League 2026/27.',
    },
  },
  ARS: {
    name: 'Mikel Arteta',
    born: '1975-01-01',
    nationality: 'ESP',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/48233.jpg',
    bio: {
      es: 'Director técnico de Arsenal FC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Arsenal FC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  ATL: {
    name: 'Diego Simeone',
    born: '1975-01-01',
    nationality: 'ARG',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/17363.jpg',
    bio: {
      es: 'Director técnico de Club Atlético de Madrid. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Club Atlético de Madrid. Competing in the UEFA Champions League 2026/27.',
    },
  },
  AVL: {
    name: 'Unai Emery',
    born: '1975-01-01',
    nationality: 'ESP',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188292.jpg',
    bio: {
      es: 'Director técnico de Aston Villa FC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Aston Villa FC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  BAR: {
    name: 'Hansi Flick',
    born: '1975-01-01',
    nationality: 'GER',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/1123.jpg',
    bio: {
      es: 'Director técnico de FC Barcelona. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of FC Barcelona. Competing in the UEFA Champions League 2026/27.',
    },
  },
  BAY: {
    name: 'Vincent Kompany',
    born: '1975-01-01',
    nationality: 'BEL',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/71507.jpg',
    bio: {
      es: 'Director técnico de FC Bayern München. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of FC Bayern München. Competing in the UEFA Champions League 2026/27.',
    },
  },
  BET: {
    name: 'Manuel Pellegrini',
    born: '1975-01-01',
    nationality: 'ITA',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/94169.jpg',
    bio: {
      es: 'Director técnico de Real Betis Balompié. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Real Betis Balompié. Competing in the UEFA Champions League 2026/27.',
    },
  },
  BOD: {
    name: 'Kjetil Knutsen',
    born: '1975-01-01',
    nationality: 'NOR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250141874.jpg',
    bio: {
      es: 'Director técnico de FK Bodø/Glimt. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of FK Bodø/Glimt. Competing in the UEFA Champions League 2026/27.',
    },
  },
  BRU: {
    name: 'Ivan Leko',
    born: '1975-01-01',
    nationality: 'CRO',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/23747.jpg',
    bio: {
      es: 'Director técnico de Club Brugge KV. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Club Brugge KV. Competing in the UEFA Champions League 2026/27.',
    },
  },
  BVB: {
    name: 'Niko Kovač',
    born: '1975-01-01',
    nationality: 'CRO',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/40175.jpg',
    bio: {
      es: 'Director técnico de Borussia Dortmund. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Borussia Dortmund. Competing in the UEFA Champions League 2026/27.',
    },
  },
  COM: {
    name: 'Cesc Fabregas',
    born: '1975-01-01',
    nationality: 'ESP',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/70072.jpg',
    bio: {
      es: 'Director técnico de Como 1907. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Como 1907. Competing in the UEFA Champions League 2026/27.',
    },
  },
  FCP: {
    name: 'Francesco Farioli',
    born: '1975-01-01',
    nationality: 'ITA',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250145892.jpg',
    bio: {
      es: 'Director técnico de FC Porto. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of FC Porto. Competing in the UEFA Champions League 2026/27.',
    },
  },
  FEN: {
    name: 'İsmail Kartal',
    born: '1975-01-01',
    nationality: 'TUR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/6623.jpg',
    bio: {
      es: 'Director técnico de Fenerbahçe SK. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Fenerbahçe SK. Competing in the UEFA Champions League 2026/27.',
    },
  },
  FEY: {
    name: 'Giovanni Van Bronckhorst',
    born: '1975-01-01',
    nationality: 'NED',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/13131.jpg',
    bio: {
      es: 'Director técnico de Feyenoord Rotterdam. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Feyenoord Rotterdam. Competing in the UEFA Champions League 2026/27.',
    },
  },
  GAL: {
    name: 'Okan Buruk',
    born: '1975-01-01',
    nationality: 'TUR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132845.jpg',
    bio: {
      es: 'Director técnico de Galatasaray SK. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Galatasaray SK. Competing in the UEFA Champions League 2026/27.',
    },
  },
  INT: {
    name: 'Cristian Chivu',
    born: '1975-01-01',
    nationality: 'ROU',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/40958.jpg',
    bio: {
      es: 'Director técnico de FC Internazionale Milano. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of FC Internazionale Milano. Competing in the UEFA Champions League 2026/27.',
    },
  },
  LIL: {
    name: 'Davide Ancelotti',
    born: '1975-01-01',
    nationality: 'ITA',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/1870984.jpg',
    bio: {
      es: 'Director técnico de Lille OSC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Lille OSC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  LIV: {
    name: 'Andoni Iraola',
    born: '1975-01-01',
    nationality: 'ESP',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/74932.jpg',
    bio: {
      es: 'Director técnico de Liverpool FC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Liverpool FC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  LSK: {
    name: 'Dietmar Kühbauer',
    born: '1975-01-01',
    nationality: 'AUT',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/150024047.jpg',
    bio: {
      es: 'Director técnico de LASK Linz. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of LASK Linz. Competing in the UEFA Champions League 2026/27.',
    },
  },
  MCI: {
    name: 'Enzo Maresca',
    born: '1975-01-01',
    nationality: 'ITA',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/30513.jpg',
    bio: {
      es: 'Director técnico de Manchester City FC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Manchester City FC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  MUN: {
    name: 'Michael Carrick',
    born: '1975-01-01',
    nationality: 'Inglaterra',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/50909.jpg',
    bio: {
      es: 'Director técnico de Manchester United FC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Manchester United FC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  NAP: {
    name: 'Massimiliano Allegri',
    born: '1975-01-01',
    nationality: 'ITA',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/22734.jpg',
    bio: {
      es: 'Director técnico de SSC Napoli. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of SSC Napoli. Competing in the UEFA Champions League 2026/27.',
    },
  },
  PSG: {
    name: 'Luis Enrique',
    born: '1975-01-01',
    nationality: 'ESP',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188797.jpg',
    bio: {
      es: 'Director técnico de Paris Saint-Germain FC. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Paris Saint-Germain FC. Competing in the UEFA Champions League 2026/27.',
    },
  },
  PSV: {
    name: 'Peter Bosz',
    born: '1975-01-01',
    nationality: 'NED',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/14619.jpg',
    bio: {
      es: 'Director técnico de PSV Eindhoven. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of PSV Eindhoven. Competing in the UEFA Champions League 2026/27.',
    },
  },
  RBL: {
    name: 'Martín Demichelis',
    born: '1975-01-01',
    nationality: 'ARG',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/72455.jpg',
    bio: {
      es: 'Director técnico de RB Leipzig. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of RB Leipzig. Competing in the UEFA Champions League 2026/27.',
    },
  },
  RCL: {
    name: 'Dino Toppmöller',
    born: '1975-01-01',
    nationality: 'GER',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2019/324x324/250080644.jpg',
    bio: {
      es: 'Director técnico de Racing Club de Lens. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Racing Club de Lens. Competing in the UEFA Champions League 2026/27.',
    },
  },
  RMA: {
    name: 'José Mourinho',
    born: '1975-01-01',
    nationality: 'POR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/63672.jpg',
    bio: {
      es: 'Director técnico de Real Madrid CF. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Real Madrid CF. Competing in the UEFA Champions League 2026/27.',
    },
  },
  ROM: {
    name: 'Gian Piero Gasperini',
    born: '1975-01-01',
    nationality: 'ITA',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250011560.jpg',
    bio: {
      es: 'Director técnico de AS Roma. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of AS Roma. Competing in the UEFA Champions League 2026/27.',
    },
  },
  SAB: {
    name: 'Valdas Dambrauskas',
    born: '1975-01-01',
    nationality: 'LTU',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250013785.jpg',
    bio: {
      es: 'Director técnico de Sabah FK. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Sabah FK. Competing in the UEFA Champions League 2026/27.',
    },
  },
  SHK: {
    name: 'Arda Turan',
    born: '1975-01-01',
    nationality: 'TUR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/74850.jpg',
    bio: {
      es: 'Director técnico de FK Shakhtar Donetsk. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of FK Shakhtar Donetsk. Competing in the UEFA Champions League 2026/27.',
    },
  },
  SLO: {
    name: 'Yaya Toure',
    born: '1975-01-01',
    nationality: 'Eslovaquia',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/95082.jpg',
    bio: {
      es: 'Director técnico de ŠK Slovan Bratislava. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of ŠK Slovan Bratislava. Competing in the UEFA Champions League 2026/27.',
    },
  },
  SLP: {
    name: 'Jindřich Trpišovský',
    born: '1975-01-01',
    nationality: 'CZE',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250085641.jpg',
    bio: {
      es: 'Director técnico de SK Slavia Praha. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of SK Slavia Praha. Competing in the UEFA Champions League 2026/27.',
    },
  },
  SPO: {
    name: 'Rui Borges',
    born: '1975-01-01',
    nationality: 'POR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197612.jpg',
    bio: {
      es: 'Director técnico de Sporting Clube de Portugal. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Sporting Clube de Portugal. Competing in the UEFA Champions League 2026/27.',
    },
  },
  VFB: {
    name: 'Sebastian Hoeneß',
    born: '1975-01-01',
    nationality: 'GER',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/72665.jpg',
    bio: {
      es: 'Director técnico de VfB Stuttgart. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of VfB Stuttgart. Competing in the UEFA Champions League 2026/27.',
    },
  },
  VIK: {
    name: 'Bjarte Lunde Aarsheim',
    born: '1975-01-01',
    nationality: 'NOR',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/28640.jpg',
    bio: {
      es: 'Director técnico de Viking FK. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Viking FK. Competing in the UEFA Champions League 2026/27.',
    },
  },
  VIL: {
    name: 'Iñigo Pérez',
    born: '1975-01-01',
    nationality: 'ESP',
    photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250012137.jpg',
    bio: {
      es: 'Director técnico de Villarreal CF. Compitiendo en la UEFA Champions League 2026/27.',
      en: 'Head coach of Villarreal CF. Competing in the UEFA Champions League 2026/27.',
    },
  },
};

export const getCoach = (teamId: string): Coach | null => COACHES[teamId] ?? null;
