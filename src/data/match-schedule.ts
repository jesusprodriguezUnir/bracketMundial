export type { GroupMatch } from './league-schedule';
export { GROUP_MATCHES } from './league-schedule';

export interface ScheduledKnockoutMatch {
  matchId: string;
  date: string;
  timeSpain: string;
  venueId: string;
  venue: string;
  city: string;
}

// 32 knockout matches with official venues and dates.
// Times are in CEST (UTC+2). Derived from official FIFA 2026 schedule (openfootball/world-cup.json).
export const KNOCKOUT_SCHEDULE: Record<string, ScheduledKnockoutMatch> = {
  'R32-01': { matchId: 'R32-01', date: '2026-06-29', timeSpain: '22:30', venueId: 'gillette',          venue: 'Gillette Stadium',          city: 'Boston' },             // M74: 16:30 EDT
  'R32-02': { matchId: 'R32-02', date: '2026-06-30', timeSpain: '23:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' }, // M77: 17:00 EDT
  'R32-03': { matchId: 'R32-03', date: '2026-06-28', timeSpain: '21:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },         // M73: 12:00 PDT
  'R32-04': { matchId: 'R32-04', date: '2026-06-30', timeSpain: '03:00', venueId: 'bbva',              venue: 'Estadio BBVA',              city: 'Monterrey' },           // M75: 19:00 CST Jun 29
  'R32-05': { matchId: 'R32-05', date: '2026-07-03', timeSpain: '01:00', venueId: 'toronto',           venue: 'Toronto Stadium',           city: 'Toronto' },            // M83: 19:00 EDT Jul 2
  'R32-06': { matchId: 'R32-06', date: '2026-07-02', timeSpain: '21:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },         // M84: 12:00 PDT
  'R32-07': { matchId: 'R32-07', date: '2026-07-02', timeSpain: '02:00', venueId: 'levis',             venue: "Levi's Stadium",            city: 'San Francisco Bay Area' }, // M81: 17:00 PDT Jul 1
  'R32-08': { matchId: 'R32-08', date: '2026-07-01', timeSpain: '22:00', venueId: 'lumen-field',       venue: 'Lumen Field',               city: 'Seattle' },             // M82: 13:00 PDT
  'R32-09': { matchId: 'R32-09', date: '2026-06-29', timeSpain: '19:00', venueId: 'nrg',              venue: 'NRG Stadium',               city: 'Houston' },             // M76: 12:00 CDT
  'R32-10': { matchId: 'R32-10', date: '2026-06-30', timeSpain: '19:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },              // M78: 12:00 CDT
  'R32-11': { matchId: 'R32-11', date: '2026-07-01', timeSpain: '03:00', venueId: 'azteca',            venue: 'Estadio Azteca',            city: 'Ciudad de México' },    // M79: 19:00 CST Jun 30
  'R32-12': { matchId: 'R32-12', date: '2026-07-01', timeSpain: '18:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },             // M80: 12:00 EDT
  'R32-13': { matchId: 'R32-13', date: '2026-07-04', timeSpain: '00:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },               // M86: 18:00 EDT Jul 3
  'R32-14': { matchId: 'R32-14', date: '2026-07-03', timeSpain: '20:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },              // M88: 13:00 CDT
  'R32-15': { matchId: 'R32-15', date: '2026-07-03', timeSpain: '05:00', venueId: 'vancouver',         venue: 'BC Place Vancouver',        city: 'Vancouver' },           // M85: 20:00 PDT Jul 2
  'R32-16': { matchId: 'R32-16', date: '2026-07-04', timeSpain: '03:30', venueId: 'arrowhead',         venue: 'Arrowhead Stadium',         city: 'Kansas City' },         // M87: 20:30 CDT Jul 3

  'R16-01': { matchId: 'R16-01', date: '2026-07-04', timeSpain: '23:00', venueId: 'lincoln-financial', venue: 'Lincoln Financial Field',   city: 'Filadelfia' },          // M89: 17:00 EDT
  'R16-02': { matchId: 'R16-02', date: '2026-07-04', timeSpain: '19:00', venueId: 'nrg',              venue: 'NRG Stadium',               city: 'Houston' },             // M90: 12:00 CDT
  'R16-03': { matchId: 'R16-03', date: '2026-07-06', timeSpain: '21:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },              // M93: 14:00 CDT
  'R16-04': { matchId: 'R16-04', date: '2026-07-07', timeSpain: '02:00', venueId: 'lumen-field',       venue: 'Lumen Field',               city: 'Seattle' },             // M94: 17:00 PDT Jul 6
  'R16-05': { matchId: 'R16-05', date: '2026-07-05', timeSpain: '22:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' }, // M91: 16:00 EDT
  'R16-06': { matchId: 'R16-06', date: '2026-07-06', timeSpain: '02:00', venueId: 'azteca',            venue: 'Estadio Azteca',            city: 'Ciudad de México' },    // M92: 18:00 CST Jul 5
  'R16-07': { matchId: 'R16-07', date: '2026-07-07', timeSpain: '18:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },             // M95: 12:00 EDT
  'R16-08': { matchId: 'R16-08', date: '2026-07-07', timeSpain: '22:00', venueId: 'vancouver',         venue: 'BC Place Vancouver',        city: 'Vancouver' },           // M96: 13:00 PDT

  'QF-01':  { matchId: 'QF-01',  date: '2026-07-09', timeSpain: '22:00', venueId: 'gillette',          venue: 'Gillette Stadium',          city: 'Boston' },             // M97: 16:00 EDT
  'QF-02':  { matchId: 'QF-02',  date: '2026-07-10', timeSpain: '21:00', venueId: 'sofi',              venue: 'SoFi Stadium',              city: 'Los Ángeles' },         // M98: 12:00 PDT
  'QF-03':  { matchId: 'QF-03',  date: '2026-07-11', timeSpain: '23:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },               // M99: 17:00 EDT
  'QF-04':  { matchId: 'QF-04',  date: '2026-07-12', timeSpain: '03:00', venueId: 'arrowhead',         venue: 'Arrowhead Stadium',         city: 'Kansas City' },         // M100: 20:00 CDT Jul 11

  'SF-01':  { matchId: 'SF-01',  date: '2026-07-14', timeSpain: '21:00', venueId: 'att-stadium',       venue: 'AT&T Stadium',              city: 'Dallas' },              // M101: 14:00 CDT
  'SF-02':  { matchId: 'SF-02',  date: '2026-07-15', timeSpain: '21:00', venueId: 'mercedes-benz',     venue: 'Mercedes-Benz Stadium',     city: 'Atlanta' },             // M102: 15:00 EDT

  'TP-01':  { matchId: 'TP-01',  date: '2026-07-18', timeSpain: '23:00', venueId: 'hard-rock',         venue: 'Hard Rock Stadium',         city: 'Miami' },               // M103: 17:00 EDT
  'FIN-01': { matchId: 'FIN-01', date: '2026-07-19', timeSpain: '21:00', venueId: 'metlife',           venue: 'MetLife Stadium',           city: 'New York New Jersey' }, // M104: 15:00 EDT
};
