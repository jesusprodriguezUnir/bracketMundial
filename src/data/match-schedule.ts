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

// 72 group-stage matches with real FIFA 2026 dates and venues.
// Venues rotate across the 16 stadiums following the official city allocation.
export const GROUP_SCHEDULE: ScheduledGroupMatch[] = [
  // === Matchday 1 (Jun 11–16) ===
  { matchId: 'M1',  date: '2026-06-11', timeSpain: '21:00', venueId: 'azteca' },        // MEX vs RSA
  { matchId: 'M2',  date: '2026-06-12', timeSpain: '00:00', venueId: 'sofi' },           // KOR vs CZE
  { matchId: 'M3',  date: '2026-06-12', timeSpain: '21:00', venueId: 'toronto' },        // CAN vs SUI
  { matchId: 'M4',  date: '2026-06-13', timeSpain: '00:00', venueId: 'nrg' },            // QAT vs BIH
  { matchId: 'M5',  date: '2026-06-13', timeSpain: '18:00', venueId: 'metlife' },        // BRA vs MAR
  { matchId: 'M6',  date: '2026-06-13', timeSpain: '21:00', venueId: 'gillette' },       // SCO vs HAI
  { matchId: 'M7',  date: '2026-06-14', timeSpain: '18:00', venueId: 'sofi' },           // USA vs PAR
  { matchId: 'M8',  date: '2026-06-14', timeSpain: '21:00', venueId: 'lumen-field' },    // AUS vs TUR
  { matchId: 'M9',  date: '2026-06-14', timeSpain: '00:00', venueId: 'mercedes-benz' },  // GER vs CUW
  { matchId: 'M10', date: '2026-06-15', timeSpain: '18:00', venueId: 'att-stadium' },    // CIV vs ECU
  { matchId: 'M11', date: '2026-06-15', timeSpain: '21:00', venueId: 'lincoln-financial' }, // NED vs JPN
  { matchId: 'M12', date: '2026-06-16', timeSpain: '00:00', venueId: 'levis' },          // TUN vs SWE
  { matchId: 'M13', date: '2026-06-16', timeSpain: '18:00', venueId: 'hard-rock' },      // BEL vs EGY
  { matchId: 'M14', date: '2026-06-16', timeSpain: '21:00', venueId: 'arrowhead' },      // IRN vs NZL
  { matchId: 'M15', date: '2026-06-17', timeSpain: '18:00', venueId: 'azteca' },         // ESP vs CPV
  { matchId: 'M16', date: '2026-06-17', timeSpain: '21:00', venueId: 'bbva' },           // URU vs KSA
  { matchId: 'M17', date: '2026-06-17', timeSpain: '00:00', venueId: 'metlife' },        // FRA vs IRQ
  { matchId: 'M18', date: '2026-06-18', timeSpain: '18:00', venueId: 'lincoln-financial' }, // SEN vs NOR
  { matchId: 'M19', date: '2026-06-18', timeSpain: '21:00', venueId: 'att-stadium' },    // ARG vs JOR
  { matchId: 'M20', date: '2026-06-19', timeSpain: '00:00', venueId: 'nrg' },            // AUT vs ALG
  { matchId: 'M21', date: '2026-06-19', timeSpain: '18:00', venueId: 'levis' },          // POR vs COD
  { matchId: 'M22', date: '2026-06-19', timeSpain: '21:00', venueId: 'sofi' },           // COL vs UZB
  { matchId: 'M23', date: '2026-06-20', timeSpain: '18:00', venueId: 'metlife' },        // ENG vs PAN
  { matchId: 'M24', date: '2026-06-20', timeSpain: '21:00', venueId: 'toronto' },        // CRO vs GHA

  // === Matchday 2 (Jun 17–22) ===
  { matchId: 'M25', date: '2026-06-21', timeSpain: '21:00', venueId: 'akron' },          // MEX vs KOR
  { matchId: 'M26', date: '2026-06-21', timeSpain: '18:00', venueId: 'gillette' },       // RSA vs CZE
  { matchId: 'M27', date: '2026-06-22', timeSpain: '18:00', venueId: 'vancouver' },      // CAN vs QAT
  { matchId: 'M28', date: '2026-06-22', timeSpain: '21:00', venueId: 'mercedes-benz' },  // SUI vs BIH
  { matchId: 'M29', date: '2026-06-22', timeSpain: '00:00', venueId: 'sofi' },           // BRA vs SCO
  { matchId: 'M30', date: '2026-06-23', timeSpain: '18:00', venueId: 'lumen-field' },    // MAR vs HAI
  { matchId: 'M31', date: '2026-06-23', timeSpain: '21:00', venueId: 'att-stadium' },    // USA vs AUS
  { matchId: 'M32', date: '2026-06-23', timeSpain: '00:00', venueId: 'arrowhead' },      // PAR vs TUR
  { matchId: 'M33', date: '2026-06-24', timeSpain: '18:00', venueId: 'nrg' },            // GER vs CIV
  { matchId: 'M34', date: '2026-06-24', timeSpain: '21:00', venueId: 'metlife' },        // CUW vs ECU
  { matchId: 'M35', date: '2026-06-24', timeSpain: '00:00', venueId: 'hard-rock' },      // NED vs TUN
  { matchId: 'M36', date: '2026-06-25', timeSpain: '18:00', venueId: 'lincoln-financial' }, // JPN vs SWE
  { matchId: 'M37', date: '2026-06-25', timeSpain: '21:00', venueId: 'levis' },          // BEL vs IRN
  { matchId: 'M38', date: '2026-06-25', timeSpain: '00:00', venueId: 'gillette' },       // EGY vs NZL
  { matchId: 'M39', date: '2026-06-26', timeSpain: '18:00', venueId: 'azteca' },         // ESP vs URU
  { matchId: 'M40', date: '2026-06-26', timeSpain: '21:00', venueId: 'akron' },          // KSA vs CPV
  { matchId: 'M41', date: '2026-06-26', timeSpain: '00:00', venueId: 'toronto' },        // FRA vs SEN
  { matchId: 'M42', date: '2026-06-27', timeSpain: '18:00', venueId: 'att-stadium' },    // NOR vs IRQ
  { matchId: 'M43', date: '2026-06-27', timeSpain: '21:00', venueId: 'mercedes-benz' },  // ARG vs AUT
  { matchId: 'M44', date: '2026-06-27', timeSpain: '00:00', venueId: 'arrowhead' },      // ALG vs JOR
  { matchId: 'M45', date: '2026-06-28', timeSpain: '18:00', venueId: 'nrg' },            // POR vs UZB
  { matchId: 'M46', date: '2026-06-28', timeSpain: '21:00', venueId: 'sofi' },           // COL vs COD
  { matchId: 'M47', date: '2026-06-28', timeSpain: '00:00', venueId: 'levis' },          // ENG vs CRO
  { matchId: 'M48', date: '2026-06-29', timeSpain: '18:00', venueId: 'metlife' },        // GHA vs PAN

  // === Matchday 3 (Jun 25–Jul 1) — simultaneous within group ===
  { matchId: 'M49', date: '2026-06-29', timeSpain: '21:00', venueId: 'azteca' },         // MEX vs CZE
  { matchId: 'M50', date: '2026-06-29', timeSpain: '21:00', venueId: 'akron' },          // RSA vs KOR
  { matchId: 'M51', date: '2026-06-30', timeSpain: '18:00', venueId: 'vancouver' },      // CAN vs BIH
  { matchId: 'M52', date: '2026-06-30', timeSpain: '18:00', venueId: 'toronto' },        // SUI vs QAT
  { matchId: 'M53', date: '2026-06-30', timeSpain: '22:00', venueId: 'gillette' },       // BRA vs HAI
  { matchId: 'M54', date: '2026-06-30', timeSpain: '22:00', venueId: 'lumen-field' },    // MAR vs SCO
  { matchId: 'M55', date: '2026-07-01', timeSpain: '18:00', venueId: 'sofi' },           // USA vs TUR
  { matchId: 'M56', date: '2026-07-01', timeSpain: '18:00', venueId: 'att-stadium' },    // PAR vs AUS
  { matchId: 'M57', date: '2026-07-01', timeSpain: '22:00', venueId: 'mercedes-benz' },  // GER vs ECU
  { matchId: 'M58', date: '2026-07-01', timeSpain: '22:00', venueId: 'nrg' },            // CUW vs CIV
  { matchId: 'M59', date: '2026-07-02', timeSpain: '18:00', venueId: 'hard-rock' },      // NED vs SWE
  { matchId: 'M60', date: '2026-07-02', timeSpain: '18:00', venueId: 'lincoln-financial' }, // JPN vs TUN
  { matchId: 'M61', date: '2026-07-02', timeSpain: '22:00', venueId: 'arrowhead' },      // BEL vs NZL
  { matchId: 'M62', date: '2026-07-02', timeSpain: '22:00', venueId: 'levis' },          // EGY vs IRN
  { matchId: 'M63', date: '2026-07-03', timeSpain: '18:00', venueId: 'azteca' },         // ESP vs KSA
  { matchId: 'M64', date: '2026-07-03', timeSpain: '18:00', venueId: 'bbva' },           // URU vs CPV
  { matchId: 'M65', date: '2026-07-03', timeSpain: '22:00', venueId: 'metlife' },        // FRA vs NOR
  { matchId: 'M66', date: '2026-07-03', timeSpain: '22:00', venueId: 'gillette' },       // SEN vs IRQ
  { matchId: 'M67', date: '2026-07-04', timeSpain: '18:00', venueId: 'att-stadium' },    // ARG vs ALG
  { matchId: 'M68', date: '2026-07-04', timeSpain: '18:00', venueId: 'mercedes-benz' },  // AUT vs JOR
  { matchId: 'M69', date: '2026-07-04', timeSpain: '22:00', venueId: 'levis' },          // POR vs COL
  { matchId: 'M70', date: '2026-07-04', timeSpain: '22:00', venueId: 'sofi' },           // COD vs UZB
  { matchId: 'M71', date: '2026-07-05', timeSpain: '18:00', venueId: 'metlife' },        // ENG vs GHA
  { matchId: 'M72', date: '2026-07-05', timeSpain: '18:00', venueId: 'toronto' },        // CRO vs PAN
];

// 32 knockout matches with official venues. Dates are approximate based on FIFA's schedule framework.
// Venue names match exactly STADIUMS[].name and STADIUMS[].city in stadiums.ts.
export const KNOCKOUT_SCHEDULE: Record<string, ScheduledKnockoutMatch> = {
  'R32-01': { matchId: 'R32-01', date: '2026-07-06', timeSpain: '22:00', venueId: 'nrg',              venue: 'NRG Stadium',               city: 'Houston' },
  'R32-02': { matchId: 'R32-02', date: '2026-07-06', timeSpain: '18:00', venueId: 'lincoln-financial', venue: 'Lincoln Financial Field',   city: 'Filadelfia' },
  'R32-03': { matchId: 'R32-03', date: '2026-07-07', timeSpain: '18:00', venueId: 'lumen-field',       venue: 'Lumen Field',               city: 'Seattle' },
  'R32-04': { matchId: 'R32-04', date: '2026-07-07', timeSpain: '22:00', venueId: 'arrowhead',         venue: 'Arrowhead Stadium',         city: 'Kansas City' },
  'R32-05': { matchId: 'R32-05', date: '2026-07-08', timeSpain: '18:00', venueId: 'gillette',          venue: 'Gillette Stadium',          city: 'Boston' },
  'R32-06': { matchId: 'R32-06', date: '2026-07-08', timeSpain: '22:00', venueId: 'akron',             venue: 'Estadio Akron',             city: 'Guadalajara' },
  'R32-07': { matchId: 'R32-07', date: '2026-07-09', timeSpain: '18:00', venueId: 'levis',             venue: "Levi's Stadium",            city: 'San Francisco Bay Area' },
  'R32-08': { matchId: 'R32-08', date: '2026-07-09', timeSpain: '22:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },
  'R32-09': { matchId: 'R32-09', date: '2026-07-10', timeSpain: '18:00', venueId: 'toronto',           venue: 'Toronto Stadium',           city: 'Toronto' },
  'R32-10': { matchId: 'R32-10', date: '2026-07-10', timeSpain: '22:00', venueId: 'bbva',              venue: 'Estadio BBVA',              city: 'Monterrey' },
  'R32-11': { matchId: 'R32-11', date: '2026-07-11', timeSpain: '18:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },
  'R32-12': { matchId: 'R32-12', date: '2026-07-11', timeSpain: '22:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  'R32-13': { matchId: 'R32-13', date: '2026-07-12', timeSpain: '18:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'R32-14': { matchId: 'R32-14', date: '2026-07-12', timeSpain: '22:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },
  'R32-15': { matchId: 'R32-15', date: '2026-07-13', timeSpain: '18:00', venueId: 'vancouver',         venue: 'BC Place Vancouver',        city: 'Vancouver' },
  'R32-16': { matchId: 'R32-16', date: '2026-07-13', timeSpain: '22:00', venueId: 'azteca',            venue: 'Estadio Azteca',            city: 'Ciudad de México' },

  'R16-01': { matchId: 'R16-01', date: '2026-07-04', timeSpain: '18:00', venueId: 'nrg',              venue: 'NRG Stadium',               city: 'Houston' },
  'R16-02': { matchId: 'R16-02', date: '2026-07-04', timeSpain: '22:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },
  'R16-03': { matchId: 'R16-03', date: '2026-07-05', timeSpain: '18:00', venueId: 'levis',             venue: "Levi's Stadium",            city: 'San Francisco Bay Area' },
  'R16-04': { matchId: 'R16-04', date: '2026-07-05', timeSpain: '22:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'R16-05': { matchId: 'R16-05', date: '2026-07-06', timeSpain: '18:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },
  'R16-06': { matchId: 'R16-06', date: '2026-07-06', timeSpain: '22:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  'R16-07': { matchId: 'R16-07', date: '2026-07-07', timeSpain: '18:00', venueId: 'gillette',          venue: 'Gillette Stadium',          city: 'Boston' },
  'R16-08': { matchId: 'R16-08', date: '2026-07-07', timeSpain: '22:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },

  'QF-01':  { matchId: 'QF-01',  date: '2026-07-09', timeSpain: '22:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'QF-02':  { matchId: 'QF-02',  date: '2026-07-10', timeSpain: '18:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },
  'QF-03':  { matchId: 'QF-03',  date: '2026-07-10', timeSpain: '22:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },
  'QF-04':  { matchId: 'QF-04',  date: '2026-07-11', timeSpain: '18:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },

  'SF-01':  { matchId: 'SF-01',  date: '2026-07-14', timeSpain: '02:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },
  'SF-02':  { matchId: 'SF-02',  date: '2026-07-15', timeSpain: '02:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },

  'TP-01':  { matchId: 'TP-01',  date: '2026-07-18', timeSpain: '23:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },
  'FIN-01': { matchId: 'FIN-01', date: '2026-07-19', timeSpain: '21:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' },
};
