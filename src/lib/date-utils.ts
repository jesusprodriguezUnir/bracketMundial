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
