/**
 * Formats a YYYY-MM-DD date string into a human-readable format for the Spanish locale.
 * Uses UTC to avoid timezone shifts when parsing 'YYYY-MM-DD' strings.
 */
export function formatFullDate(isoDate: string): string {
  if (!isoDate) return '';
  
  try {
    // Append T12:00:00 to ensure it's treated as a specific moment 
    // and not shifted to the previous day in western timezones 
    // if parsed as UTC 00:00 and displayed in local.
    // However, the best way for 'YYYY-MM-DD' is to use UTC throughout.
    const date = new Date(`${isoDate}T12:00:00Z`);
    
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      timeZone: 'UTC'
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', isoDate, e);
    return isoDate;
  }
}

/**
 * Formats a YYYY-MM-DD date string into a short human-readable format (e.g., "11 jun").
 */
export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '';

  try {
    const date = new Date(`${isoDate}T12:00:00Z`);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC'
    }).format(date);
  } catch (e) {
    return isoDate;
  }
}

/** Returns true if the match kickoff (CEST, UTC+2) is still in the future. */
export function isMatchPending(date: string, timeSpain: string): boolean {
  if (!date) return true;
  try {
    const kickoff = new Date(`${date}T${timeSpain || '00:00'}:00+02:00`);
    return kickoff.getTime() > Date.now();
  } catch {
    return true;
  }
}

/** Calculates age in full years from a YYYY-MM-DD birth date. */
export function coachAge(born: string): number {
  const b = new Date(`${born}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age;
}
