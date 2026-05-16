// Mapeos ES/EN compartidos por el generador de páginas estáticas SEO.

export const SITE_URL = 'https://bracketmundial.com';
export const OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

/** Nombres en inglés de las 48 selecciones, indexados por id FIFA. */
export const TEAM_NAME_EN = {
  MEX: 'Mexico', RSA: 'South Africa', KOR: 'South Korea', CZE: 'Czechia',
  CAN: 'Canada', SUI: 'Switzerland', QAT: 'Qatar', BIH: 'Bosnia and Herzegovina',
  BRA: 'Brazil', MAR: 'Morocco', SCO: 'Scotland', HAI: 'Haiti',
  USA: 'United States', PAR: 'Paraguay', AUS: 'Australia', TUR: 'Turkey',
  GER: 'Germany', CUW: 'Curaçao', CIV: 'Ivory Coast', ECU: 'Ecuador',
  NED: 'Netherlands', JPN: 'Japan', TUN: 'Tunisia', SWE: 'Sweden',
  BEL: 'Belgium', EGY: 'Egypt', IRN: 'Iran', NZL: 'New Zealand',
  ESP: 'Spain', URU: 'Uruguay', KSA: 'Saudi Arabia', CPV: 'Cape Verde',
  FRA: 'France', SEN: 'Senegal', NOR: 'Norway', IRQ: 'Iraq',
  ARG: 'Argentina', AUT: 'Austria', ALG: 'Algeria', JOR: 'Jordan',
  POR: 'Portugal', COL: 'Colombia', UZB: 'Uzbekistan', COD: 'DR Congo',
  ENG: 'England', CRO: 'Croatia', GHA: 'Ghana', PAN: 'Panama',
};

/** País del estadio normalizado a inglés. */
export const STADIUM_COUNTRY_EN = {
  'México': 'Mexico',
  'Canadá': 'Canada',
  'USA': 'United States',
};

export function countryEn(esCountry) {
  return STADIUM_COUNTRY_EN[esCountry] ?? esCountry;
}

/** Convierte un texto en slug URL-safe (sin diacríticos). */
export function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function teamNameEs(team) {
  return team.name;
}

export function teamNameEn(team) {
  return TEAM_NAME_EN[team.id] ?? team.name;
}

/** Escapa texto para insertarlo de forma segura en HTML. */
export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
