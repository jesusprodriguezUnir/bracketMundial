// Official FIFA World Cup 2026 schedule — group match dates/times and knockout venues.
// timeSpain = CEST (UTC+2) for summer 2026.

export interface ScheduledGroupMatch {
  matchId: string;        // M1..M72
  date: string;           // YYYY-MM-DD
  timeSpain: string;      // HH:MM CEST
  venueId: string;        // Stadium.id
}

export interface ScheduledKnockoutMatch {
  matchId: string;        // R32-01..FIN-01
  date: string;
  timeSpain: string;
  venueId: string;
  venue: string;          // Stadium.name (denormalised for fast access)
  city: string;           // Stadium.city
}

// Venues rotate across the 16 stadiums following the official city allocation.
export const GROUP_SCHEDULE: ScheduledGroupMatch[] = [
  // === Matchday 1 (Jun 11–16) ===
  { matchId: 'M1',  date: '2026-06-11', timeSpain: '21:00', venueId: 'azteca' },
  { matchId: 'M2',  date: '2026-06-11', timeSpain: '23:00', venueId: 'akron' },
  { matchId: 'M3',  date: '2026-06-12', timeSpain: '21:00', venueId: 'toronto' },
  { matchId: 'M4',  date: '2026-06-12', timeSpain: '23:00', venueId: 'sofi' },
  { matchId: 'M5',  date: '2026-06-13', timeSpain: '18:00', venueId: 'gillette' },
  { matchId: 'M6',  date: '2026-06-13', timeSpain: '21:00', venueId: 'vancouver' },
  { matchId: 'M7',  date: '2026-06-13', timeSpain: '00:00', venueId: 'metlife' },
  { matchId: 'M8',  date: '2026-06-13', timeSpain: '03:00', venueId: 'levis' },
  { matchId: 'M9',  date: '2026-06-14', timeSpain: '18:00', venueId: 'lincoln-financial' },
  { matchId: 'M10', date: '2026-06-14', timeSpain: '21:00', venueId: 'nrg' },
  { matchId: 'M11', date: '2026-06-14', timeSpain: '00:00', venueId: 'att-stadium' },
  { matchId: 'M12', date: '2026-06-14', timeSpain: '03:00', venueId: 'bbva' },
  { matchId: 'M13', date: '2026-06-15', timeSpain: '18:00', venueId: 'hard-rock' },
  { matchId: 'M14', date: '2026-06-15', timeSpain: '21:00', venueId: 'mercedes-benz' },
  { matchId: 'M15', date: '2026-06-15', timeSpain: '00:00', venueId: 'sofi' },
  { matchId: 'M16', date: '2026-06-15', timeSpain: '03:00', venueId: 'lumen-field' },
  { matchId: 'M17', date: '2026-06-16', timeSpain: '18:00', venueId: 'metlife' },
  { matchId: 'M18', date: '2026-06-16', timeSpain: '21:00', venueId: 'gillette' },
  { matchId: 'M19', date: '2026-06-16', timeSpain: '00:00', venueId: 'arrowhead' },
  { matchId: 'M20', date: '2026-06-16', timeSpain: '03:00', venueId: 'levis' },
  { matchId: 'M21', date: '2026-06-17', timeSpain: '18:00', venueId: 'toronto' },
  { matchId: 'M22', date: '2026-06-17', timeSpain: '21:00', venueId: 'att-stadium' },
  { matchId: 'M23', date: '2026-06-17', timeSpain: '00:00', venueId: 'nrg' },
  { matchId: 'M24', date: '2026-06-17', timeSpain: '03:00', venueId: 'azteca' },

  // === Matchday 2 (Jun 18–23) ===
  { matchId: 'M25', date: '2026-06-18', timeSpain: '18:00', venueId: 'mercedes-benz' },
  { matchId: 'M26', date: '2026-06-18', timeSpain: '21:00', venueId: 'sofi' },
  { matchId: 'M27', date: '2026-06-18', timeSpain: '00:00', venueId: 'vancouver' },
  { matchId: 'M28', date: '2026-06-18', timeSpain: '03:00', venueId: 'akron' },
  { matchId: 'M29', date: '2026-06-19', timeSpain: '18:00', venueId: 'lincoln-financial' },
  { matchId: 'M30', date: '2026-06-19', timeSpain: '21:00', venueId: 'gillette' },
  { matchId: 'M31', date: '2026-06-19', timeSpain: '00:00', venueId: 'levis' },
  { matchId: 'M32', date: '2026-06-19', timeSpain: '03:00', venueId: 'lumen-field' },
  { matchId: 'M33', date: '2026-06-20', timeSpain: '18:00', venueId: 'toronto' },
  { matchId: 'M34', date: '2026-06-20', timeSpain: '21:00', venueId: 'arrowhead' },
  { matchId: 'M35', date: '2026-06-20', timeSpain: '00:00', venueId: 'nrg' },
  { matchId: 'M36', date: '2026-06-20', timeSpain: '03:00', venueId: 'bbva' },
  { matchId: 'M37', date: '2026-06-21', timeSpain: '18:00', venueId: 'hard-rock' },
  { matchId: 'M38', date: '2026-06-21', timeSpain: '21:00', venueId: 'mercedes-benz' },
  { matchId: 'M39', date: '2026-06-21', timeSpain: '00:00', venueId: 'sofi' },
  { matchId: 'M40', date: '2026-06-21', timeSpain: '03:00', venueId: 'vancouver' },
  { matchId: 'M41', date: '2026-06-22', timeSpain: '18:00', venueId: 'metlife' },
  { matchId: 'M42', date: '2026-06-22', timeSpain: '21:00', venueId: 'lincoln-financial' },
  { matchId: 'M43', date: '2026-06-22', timeSpain: '00:00', venueId: 'att-stadium' },
  { matchId: 'M44', date: '2026-06-22', timeSpain: '03:00', venueId: 'levis' },
  { matchId: 'M45', date: '2026-06-23', timeSpain: '18:00', venueId: 'gillette' },
  { matchId: 'M46', date: '2026-06-23', timeSpain: '21:00', venueId: 'toronto' },
  { matchId: 'M47', date: '2026-06-23', timeSpain: '00:00', venueId: 'nrg' },
  { matchId: 'M48', date: '2026-06-23', timeSpain: '03:00', venueId: 'akron' },

  // === Matchday 3 (Jun 24–27) ===
  { matchId: 'M49', date: '2026-06-24', timeSpain: '18:00', venueId: 'hard-rock' },
  { matchId: 'M50', date: '2026-06-24', timeSpain: '18:00', venueId: 'mercedes-benz' },
  { matchId: 'M51', date: '2026-06-24', timeSpain: '22:00', venueId: 'vancouver' },
  { matchId: 'M52', date: '2026-06-24', timeSpain: '22:00', venueId: 'lumen-field' },
  { matchId: 'M53', date: '2026-06-24', timeSpain: '22:00', venueId: 'azteca' },
  { matchId: 'M54', date: '2026-06-24', timeSpain: '22:00', venueId: 'bbva' },
  { matchId: 'M55', date: '2026-06-25', timeSpain: '18:00', venueId: 'lincoln-financial' },
  { matchId: 'M56', date: '2026-06-25', timeSpain: '18:00', venueId: 'metlife' },
  { matchId: 'M57', date: '2026-06-25', timeSpain: '22:00', venueId: 'att-stadium' },
  { matchId: 'M58', date: '2026-06-25', timeSpain: '22:00', venueId: 'arrowhead' },
  { matchId: 'M59', date: '2026-06-25', timeSpain: '22:00', venueId: 'sofi' },
  { matchId: 'M60', date: '2026-06-25', timeSpain: '22:00', venueId: 'levis' },
  { matchId: 'M61', date: '2026-06-26', timeSpain: '18:00', venueId: 'gillette' },
  { matchId: 'M62', date: '2026-06-26', timeSpain: '18:00', venueId: 'toronto' },
  { matchId: 'M63', date: '2026-06-26', timeSpain: '22:00', venueId: 'lumen-field' },
  { matchId: 'M64', date: '2026-06-26', timeSpain: '22:00', venueId: 'vancouver' },
  { matchId: 'M65', date: '2026-06-26', timeSpain: '22:00', venueId: 'nrg' },
  { matchId: 'M66', date: '2026-06-26', timeSpain: '22:00', venueId: 'akron' },
  { matchId: 'M67', date: '2026-06-27', timeSpain: '18:00', venueId: 'metlife' },
  { matchId: 'M68', date: '2026-06-27', timeSpain: '18:00', venueId: 'lincoln-financial' },
  { matchId: 'M69', date: '2026-06-27', timeSpain: '22:00', venueId: 'arrowhead' },
  { matchId: 'M70', date: '2026-06-27', timeSpain: '22:00', venueId: 'att-stadium' },
  { matchId: 'M71', date: '2026-06-27', timeSpain: '22:00', venueId: 'hard-rock' },
  { matchId: 'M72', date: '2026-06-27', timeSpain: '22:00', venueId: 'mercedes-benz' },
];

// 32 knockout matches with official venues and dates.
export const KNOCKOUT_SCHEDULE: Record<string, ScheduledKnockoutMatch> = {
  'R32-01': { matchId: 'R32-01', date: '2026-06-29', timeSpain: '22:00', venueId: 'gillette',          venue: 'Gillette Stadium',          city: 'Boston' },
  'R32-02': { matchId: 'R32-02', date: '2026-06-30', timeSpain: '18:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },
  'R32-03': { matchId: 'R32-03', date: '2026-06-28', timeSpain: '21:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },
  'R32-04': { matchId: 'R32-04', date: '2026-06-29', timeSpain: '18:00', venueId: 'bbva',              venue: 'Estadio BBVA',              city: 'Monterrey' },
  'R32-05': { matchId: 'R32-05', date: '2026-07-02', timeSpain: '18:00', venueId: 'toronto',           venue: 'Toronto Stadium',           city: 'Toronto' },
  'R32-06': { matchId: 'R32-06', date: '2026-07-02', timeSpain: '22:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },
  'R32-07': { matchId: 'R32-07', date: '2026-07-01', timeSpain: '18:00', venueId: 'levis',             venue: "Levi's Stadium",            city: 'San Francisco Bay Area' },
  'R32-08': { matchId: 'R32-08', date: '2026-07-01', timeSpain: '22:00', venueId: 'lumen-field',       venue: 'Lumen Field',               city: 'Seattle' },
  'R32-09': { matchId: 'R32-09', date: '2026-06-29', timeSpain: '22:00', venueId: 'nrg',              venue: 'NRG Stadium',               city: 'Houston' },
  'R32-10': { matchId: 'R32-10', date: '2026-06-30', timeSpain: '22:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'R32-11': { matchId: 'R32-11', date: '2026-06-30', timeSpain: '18:00', venueId: 'azteca',            venue: 'Estadio Azteca',            city: 'Ciudad de México' },
  'R32-12': { matchId: 'R32-12', date: '2026-07-01', timeSpain: '18:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  'R32-13': { matchId: 'R32-13', date: '2026-07-03', timeSpain: '18:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },
  'R32-14': { matchId: 'R32-14', date: '2026-07-03', timeSpain: '22:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'R32-15': { matchId: 'R32-15', date: '2026-07-02', timeSpain: '18:00', venueId: 'vancouver',         venue: 'BC Place Vancouver',        city: 'Vancouver' },
  'R32-16': { matchId: 'R32-16', date: '2026-07-03', timeSpain: '18:00', venueId: 'arrowhead',         venue: 'Arrowhead Stadium',         city: 'Kansas City' },

  'R16-01': { matchId: 'R16-01', date: '2026-07-04', timeSpain: '18:00', venueId: 'lincoln-financial', venue: 'Lincoln Financial Field',   city: 'Filadelfia' },
  'R16-02': { matchId: 'R16-02', date: '2026-07-04', timeSpain: '22:00', venueId: 'nrg',              venue: 'NRG Stadium',               city: 'Houston' },
  'R16-03': { matchId: 'R16-03', date: '2026-07-06', timeSpain: '18:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'R16-04': { matchId: 'R16-04', date: '2026-07-06', timeSpain: '22:00', venueId: 'lumen-field',       venue: 'Lumen Field',               city: 'Seattle' },
  'R16-05': { matchId: 'R16-05', date: '2026-07-05', timeSpain: '18:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },
  'R16-06': { matchId: 'R16-06', date: '2026-07-05', timeSpain: '22:00', venueId: 'azteca',            venue: 'Estadio Azteca',            city: 'Ciudad de México' },
  'R16-07': { matchId: 'R16-07', date: '2026-07-07', timeSpain: '18:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  'R16-08': { matchId: 'R16-08', date: '2026-07-07', timeSpain: '22:00', venueId: 'vancouver',         venue: 'BC Place Vancouver',        city: 'Vancouver' },

  'QF-01':  { matchId: 'QF-01',  date: '2026-07-09', timeSpain: '22:00', venueId: 'gillette',          venue: 'Gillette Stadium',          city: 'Boston' },
  'QF-02':  { matchId: 'QF-02',  date: '2026-07-10', timeSpain: '22:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },
  'QF-03':  { matchId: 'QF-03',  date: '2026-07-11', timeSpain: '18:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },
  'QF-04':  { matchId: 'QF-04',  date: '2026-07-11', timeSpain: '22:00', venueId: 'arrowhead',         venue: 'Arrowhead Stadium',         city: 'Kansas City' },

  'SF-01':  { matchId: 'SF-01',  date: '2026-07-14', timeSpain: '22:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'SF-02':  { matchId: 'SF-02',  date: '2026-07-15', timeSpain: '22:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },

  'TP-01':  { matchId: 'TP-01',  date: '2026-07-18', timeSpain: '22:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },
  'FIN-01': { matchId: 'FIN-01', date: '2026-07-19', timeSpain: '21:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },
};
