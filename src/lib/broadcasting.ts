/**
 * List of match IDs that are broadcasted for free on RTVE in Spain.
 * This includes the 17 confirmed group stage matches.
 */
export const RTVE_MATCH_IDS = [
  'M1',  // Mexico vs. South Africa
  'M3',  // Canada vs. Bosnia and Herzegovina
  'M7',  // Brazil vs. Morocco
  'M10', // Germany vs. Curacao
  'M14', // Spain vs. Cape Verde
  'M17', // France vs. Senegal
  'M22', // England vs. Croatia
  'M26', // Switzerland vs. Bosnia and Herzegovina
  'M32', // USA vs. Australia
  'M35', // Netherlands vs. Sweden
  'M38', // Spain vs. Saudi Arabia
  'M43', // Argentina vs. Austria
  'M45', // England vs. Ghana
  'M49', // Scotland vs. Brazil
  'M56', // Ecuador vs. Germany
  'M66', // Uruguay vs. Spain
  'M71', // Colombia vs. Portugal
];

/**
 * Knockout matches that are broadcasted for free on RTVE.
 * Semifinals, 3rd place and Final are confirmed.
 * R32 and R16 will have a "selection" (not fully confirmed which ones yet).
 */
export const RTVE_KNOCKOUT_IDS = [
  'SF-01',
  'SF-02',
  'TP-01',
  'FIN-01'
];

export type BroadcastType = 'RTVE' | 'DAZN' | 'BOTH';

/**
 * Returns the broadcast information for a match.
 * In Spain, DAZN has all 104 matches.
 * RTVE has 33 matches (selection).
 */
export function getBroadcastInfo(matchId: string, teamA?: string, teamB?: string): BroadcastType {
  // All matches are on DAZN
  const isOnRTVE = 
    RTVE_MATCH_IDS.includes(matchId) || 
    RTVE_KNOCKOUT_IDS.includes(matchId) ||
    teamA === 'ESP' || 
    teamB === 'ESP';

  if (isOnRTVE) {
    return 'BOTH';
  }

  return 'DAZN';
}
