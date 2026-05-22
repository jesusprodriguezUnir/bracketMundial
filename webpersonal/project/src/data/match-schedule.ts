// Official FIFA World Cup 2026 schedule — group matches and knockout venues.
// timeSpain = CEST (UTC+2) for summer 2026.
// Conversions: EDT(UTC-4)+6h · CDT(UTC-5)+7h · Mexico/CST(UTC-6)+8h · PDT(UTC-7)+9h

export interface GroupMatch {
  matchId: string;      // M1..M72
  group: string;        // 'A'..'L'
  teamA: string;        // team id (e.g. 'MEX')
  teamB: string;
  matchDay: 1 | 2 | 3;
  date: string;         // YYYY-MM-DD in CEST
  timeSpain: string;    // HH:MM CEST
  venueId: string;      // Stadium.id
}

export interface ScheduledKnockoutMatch {
  matchId: string;      // R32-01..FIN-01
  date: string;
  timeSpain: string;
  venueId: string;
  venue: string;        // Stadium.name (denormalised for fast access)
  city: string;         // Stadium.city
}

// 72 group stage matches — ordered by match number (chronological FIFA assignment).
export const GROUP_MATCHES: GroupMatch[] = [
  // === Matchday 1 (Jun 11–16) ===
  { matchId: 'M1',  group: 'A', teamA: 'MEX', teamB: 'RSA', matchDay: 1, date: '2026-06-11', timeSpain: '21:00', venueId: 'azteca' },
  { matchId: 'M2',  group: 'A', teamA: 'KOR', teamB: 'CZE', matchDay: 1, date: '2026-06-12', timeSpain: '04:00', venueId: 'akron' },
  { matchId: 'M3',  group: 'B', teamA: 'CAN', teamB: 'BIH', matchDay: 1, date: '2026-06-12', timeSpain: '21:00', venueId: 'toronto' },
  { matchId: 'M4',  group: 'D', teamA: 'USA', teamB: 'PAR', matchDay: 1, date: '2026-06-13', timeSpain: '03:00', venueId: 'sofi' },
  { matchId: 'M5',  group: 'C', teamA: 'HAI', teamB: 'SCO', matchDay: 1, date: '2026-06-14', timeSpain: '03:00', venueId: 'gillette' },
  { matchId: 'M6',  group: 'D', teamA: 'AUS', teamB: 'TUR', matchDay: 1, date: '2026-06-14', timeSpain: '06:00', venueId: 'vancouver' },
  { matchId: 'M7',  group: 'C', teamA: 'BRA', teamB: 'MAR', matchDay: 1, date: '2026-06-14', timeSpain: '00:00', venueId: 'metlife' },
  { matchId: 'M8',  group: 'B', teamA: 'QAT', teamB: 'SUI', matchDay: 1, date: '2026-06-13', timeSpain: '21:00', venueId: 'levis' },
  { matchId: 'M9',  group: 'E', teamA: 'CIV', teamB: 'ECU', matchDay: 1, date: '2026-06-15', timeSpain: '01:00', venueId: 'lincoln-financial' },
  { matchId: 'M10', group: 'E', teamA: 'GER', teamB: 'CUW', matchDay: 1, date: '2026-06-14', timeSpain: '19:00', venueId: 'nrg' },
  { matchId: 'M11', group: 'F', teamA: 'NED', teamB: 'JPN', matchDay: 1, date: '2026-06-14', timeSpain: '22:00', venueId: 'att-stadium' },
  { matchId: 'M12', group: 'F', teamA: 'SWE', teamB: 'TUN', matchDay: 1, date: '2026-06-15', timeSpain: '04:00', venueId: 'bbva' },
  { matchId: 'M13', group: 'H', teamA: 'KSA', teamB: 'URU', matchDay: 1, date: '2026-06-16', timeSpain: '00:00', venueId: 'hard-rock' },
  { matchId: 'M14', group: 'H', teamA: 'ESP', teamB: 'CPV', matchDay: 1, date: '2026-06-15', timeSpain: '18:00', venueId: 'mercedes-benz' },
  { matchId: 'M15', group: 'G', teamA: 'IRN', teamB: 'NZL', matchDay: 1, date: '2026-06-16', timeSpain: '03:00', venueId: 'sofi' },
  { matchId: 'M16', group: 'G', teamA: 'BEL', teamB: 'EGY', matchDay: 1, date: '2026-06-15', timeSpain: '21:00', venueId: 'lumen-field' },
  { matchId: 'M17', group: 'I', teamA: 'FRA', teamB: 'SEN', matchDay: 1, date: '2026-06-16', timeSpain: '21:00', venueId: 'metlife' },
  { matchId: 'M18', group: 'I', teamA: 'IRQ', teamB: 'NOR', matchDay: 1, date: '2026-06-17', timeSpain: '00:00', venueId: 'gillette' },
  { matchId: 'M19', group: 'J', teamA: 'ARG', teamB: 'ALG', matchDay: 1, date: '2026-06-17', timeSpain: '03:00', venueId: 'arrowhead' },
  { matchId: 'M20', group: 'J', teamA: 'AUT', teamB: 'JOR', matchDay: 1, date: '2026-06-17', timeSpain: '06:00', venueId: 'levis' },
  { matchId: 'M21', group: 'L', teamA: 'GHA', teamB: 'PAN', matchDay: 1, date: '2026-06-18', timeSpain: '01:00', venueId: 'toronto' },
  { matchId: 'M22', group: 'L', teamA: 'ENG', teamB: 'CRO', matchDay: 1, date: '2026-06-17', timeSpain: '22:00', venueId: 'att-stadium' },
  { matchId: 'M23', group: 'K', teamA: 'POR', teamB: 'COD', matchDay: 1, date: '2026-06-17', timeSpain: '19:00', venueId: 'nrg' },
  { matchId: 'M24', group: 'K', teamA: 'UZB', teamB: 'COL', matchDay: 1, date: '2026-06-18', timeSpain: '04:00', venueId: 'azteca' },

  // === Matchday 2 (Jun 18–23) ===
  { matchId: 'M25', group: 'A', teamA: 'CZE', teamB: 'RSA', matchDay: 2, date: '2026-06-18', timeSpain: '18:00', venueId: 'mercedes-benz' },
  { matchId: 'M26', group: 'B', teamA: 'SUI', teamB: 'BIH', matchDay: 2, date: '2026-06-18', timeSpain: '21:00', venueId: 'sofi' },
  { matchId: 'M27', group: 'B', teamA: 'CAN', teamB: 'QAT', matchDay: 2, date: '2026-06-19', timeSpain: '00:00', venueId: 'vancouver' },
  { matchId: 'M28', group: 'A', teamA: 'MEX', teamB: 'KOR', matchDay: 2, date: '2026-06-19', timeSpain: '03:00', venueId: 'akron' },
  { matchId: 'M29', group: 'C', teamA: 'BRA', teamB: 'HAI', matchDay: 2, date: '2026-06-20', timeSpain: '02:30', venueId: 'lincoln-financial' },
  { matchId: 'M30', group: 'C', teamA: 'SCO', teamB: 'MAR', matchDay: 2, date: '2026-06-20', timeSpain: '00:00', venueId: 'gillette' },
  { matchId: 'M31', group: 'D', teamA: 'TUR', teamB: 'PAR', matchDay: 2, date: '2026-06-20', timeSpain: '05:00', venueId: 'levis' },
  { matchId: 'M32', group: 'D', teamA: 'USA', teamB: 'AUS', matchDay: 2, date: '2026-06-19', timeSpain: '21:00', venueId: 'lumen-field' },
  { matchId: 'M33', group: 'E', teamA: 'GER', teamB: 'CIV', matchDay: 2, date: '2026-06-20', timeSpain: '22:00', venueId: 'toronto' },
  { matchId: 'M34', group: 'E', teamA: 'ECU', teamB: 'CUW', matchDay: 2, date: '2026-06-21', timeSpain: '02:00', venueId: 'arrowhead' },
  { matchId: 'M35', group: 'F', teamA: 'NED', teamB: 'SWE', matchDay: 2, date: '2026-06-20', timeSpain: '19:00', venueId: 'nrg' },
  { matchId: 'M36', group: 'F', teamA: 'TUN', teamB: 'JPN', matchDay: 2, date: '2026-06-21', timeSpain: '06:00', venueId: 'bbva' },
  { matchId: 'M37', group: 'H', teamA: 'URU', teamB: 'CPV', matchDay: 2, date: '2026-06-22', timeSpain: '00:00', venueId: 'hard-rock' },
  { matchId: 'M38', group: 'H', teamA: 'ESP', teamB: 'KSA', matchDay: 2, date: '2026-06-21', timeSpain: '18:00', venueId: 'mercedes-benz' },
  { matchId: 'M39', group: 'G', teamA: 'BEL', teamB: 'IRN', matchDay: 2, date: '2026-06-21', timeSpain: '21:00', venueId: 'sofi' },
  { matchId: 'M40', group: 'G', teamA: 'NZL', teamB: 'EGY', matchDay: 2, date: '2026-06-22', timeSpain: '03:00', venueId: 'vancouver' },
  { matchId: 'M41', group: 'I', teamA: 'NOR', teamB: 'SEN', matchDay: 2, date: '2026-06-23', timeSpain: '02:00', venueId: 'metlife' },
  { matchId: 'M42', group: 'I', teamA: 'FRA', teamB: 'IRQ', matchDay: 2, date: '2026-06-22', timeSpain: '23:00', venueId: 'lincoln-financial' },
  { matchId: 'M43', group: 'J', teamA: 'ARG', teamB: 'AUT', matchDay: 2, date: '2026-06-22', timeSpain: '19:00', venueId: 'att-stadium' },
  { matchId: 'M44', group: 'J', teamA: 'JOR', teamB: 'ALG', matchDay: 2, date: '2026-06-23', timeSpain: '05:00', venueId: 'levis' },
  { matchId: 'M45', group: 'L', teamA: 'ENG', teamB: 'GHA', matchDay: 2, date: '2026-06-23', timeSpain: '22:00', venueId: 'gillette' },
  { matchId: 'M46', group: 'L', teamA: 'PAN', teamB: 'CRO', matchDay: 2, date: '2026-06-24', timeSpain: '01:00', venueId: 'toronto' },
  { matchId: 'M47', group: 'K', teamA: 'POR', teamB: 'UZB', matchDay: 2, date: '2026-06-23', timeSpain: '19:00', venueId: 'nrg' },
  { matchId: 'M48', group: 'K', teamA: 'COL', teamB: 'COD', matchDay: 2, date: '2026-06-24', timeSpain: '04:00', venueId: 'akron' },

  // === Matchday 3 (Jun 24–27) — simultaneous per group ===
  { matchId: 'M49', group: 'C', teamA: 'SCO', teamB: 'BRA', matchDay: 3, date: '2026-06-25', timeSpain: '00:00', venueId: 'hard-rock' },
  { matchId: 'M50', group: 'C', teamA: 'MAR', teamB: 'HAI', matchDay: 3, date: '2026-06-25', timeSpain: '00:00', venueId: 'mercedes-benz' },
  { matchId: 'M51', group: 'B', teamA: 'SUI', teamB: 'CAN', matchDay: 3, date: '2026-06-24', timeSpain: '21:00', venueId: 'vancouver' },
  { matchId: 'M52', group: 'B', teamA: 'BIH', teamB: 'QAT', matchDay: 3, date: '2026-06-24', timeSpain: '21:00', venueId: 'lumen-field' },
  { matchId: 'M53', group: 'A', teamA: 'CZE', teamB: 'MEX', matchDay: 3, date: '2026-06-25', timeSpain: '03:00', venueId: 'azteca' },
  { matchId: 'M54', group: 'A', teamA: 'RSA', teamB: 'KOR', matchDay: 3, date: '2026-06-25', timeSpain: '03:00', venueId: 'bbva' },
  { matchId: 'M55', group: 'E', teamA: 'CUW', teamB: 'CIV', matchDay: 3, date: '2026-06-25', timeSpain: '22:00', venueId: 'lincoln-financial' },
  { matchId: 'M56', group: 'E', teamA: 'ECU', teamB: 'GER', matchDay: 3, date: '2026-06-25', timeSpain: '22:00', venueId: 'metlife' },
  { matchId: 'M57', group: 'F', teamA: 'JPN', teamB: 'SWE', matchDay: 3, date: '2026-06-26', timeSpain: '01:00', venueId: 'att-stadium' },
  { matchId: 'M58', group: 'F', teamA: 'TUN', teamB: 'NED', matchDay: 3, date: '2026-06-26', timeSpain: '01:00', venueId: 'arrowhead' },
  { matchId: 'M59', group: 'D', teamA: 'TUR', teamB: 'USA', matchDay: 3, date: '2026-06-26', timeSpain: '04:00', venueId: 'sofi' },
  { matchId: 'M60', group: 'D', teamA: 'PAR', teamB: 'AUS', matchDay: 3, date: '2026-06-26', timeSpain: '04:00', venueId: 'levis' },
  { matchId: 'M61', group: 'I', teamA: 'NOR', teamB: 'FRA', matchDay: 3, date: '2026-06-26', timeSpain: '21:00', venueId: 'gillette' },
  { matchId: 'M62', group: 'I', teamA: 'SEN', teamB: 'IRQ', matchDay: 3, date: '2026-06-26', timeSpain: '21:00', venueId: 'toronto' },
  { matchId: 'M63', group: 'G', teamA: 'EGY', teamB: 'IRN', matchDay: 3, date: '2026-06-27', timeSpain: '05:00', venueId: 'lumen-field' },
  { matchId: 'M64', group: 'G', teamA: 'NZL', teamB: 'BEL', matchDay: 3, date: '2026-06-27', timeSpain: '05:00', venueId: 'vancouver' },
  { matchId: 'M65', group: 'H', teamA: 'CPV', teamB: 'KSA', matchDay: 3, date: '2026-06-27', timeSpain: '02:00', venueId: 'nrg' },
  { matchId: 'M66', group: 'H', teamA: 'URU', teamB: 'ESP', matchDay: 3, date: '2026-06-27', timeSpain: '02:00', venueId: 'akron' },
  { matchId: 'M67', group: 'L', teamA: 'PAN', teamB: 'ENG', matchDay: 3, date: '2026-06-27', timeSpain: '23:00', venueId: 'metlife' },
  { matchId: 'M68', group: 'L', teamA: 'CRO', teamB: 'GHA', matchDay: 3, date: '2026-06-27', timeSpain: '23:00', venueId: 'lincoln-financial' },
  { matchId: 'M69', group: 'J', teamA: 'ALG', teamB: 'AUT', matchDay: 3, date: '2026-06-28', timeSpain: '04:00', venueId: 'arrowhead' },
  { matchId: 'M70', group: 'J', teamA: 'JOR', teamB: 'ARG', matchDay: 3, date: '2026-06-28', timeSpain: '04:00', venueId: 'att-stadium' },
  { matchId: 'M71', group: 'K', teamA: 'COL', teamB: 'POR', matchDay: 3, date: '2026-06-28', timeSpain: '01:30', venueId: 'hard-rock' },
  { matchId: 'M72', group: 'K', teamA: 'COD', teamB: 'UZB', matchDay: 3, date: '2026-06-28', timeSpain: '01:30', venueId: 'mercedes-benz' },
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
