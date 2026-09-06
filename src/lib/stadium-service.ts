import { UCL_CLUBS_DATA } from '../data/ucl-clubs';

export interface TeamStadiumInfo {
  clubId: string;
  clubName: string;
  shortName: string;
  city: string;
  country: string;
  stadiumName: string;
  capacity: number;
  image: string;
  colors: [string, string];
}

/** Ruta a la foto oficial del estadio del club. */
export const stadiumImageSrc = (clubId: string): string => `/assets/stadiums/${clubId}.webp`;

export interface StadiumStats {
  totalStadiums: number;
  totalCapacity: number;
  averageCapacity: number;
  largestStadium: TeamStadiumInfo;
  smallestStadium: TeamStadiumInfo;
}

/**
 * Obtiene todos los estadios de cada uno de los clubes participantes.
 */
export function getAllTeamStadiums(options?: {
  sortBy?: 'capacity' | 'name' | 'club' | 'city';
  order?: 'asc' | 'desc';
  country?: string;
}): TeamStadiumInfo[] {
  const sortBy = options?.sortBy ?? 'capacity';
  const order = options?.order ?? 'desc';
  const country = options?.country;

  let stadiums: TeamStadiumInfo[] = Object.values(UCL_CLUBS_DATA).map(club => ({
    clubId: club.id,
    clubName: club.name,
    shortName: club.shortName,
    city: club.city,
    country: club.country,
    stadiumName: club.stadium.name,
    capacity: club.stadium.capacity,
    image: stadiumImageSrc(club.id),
    colors: club.colors,
  }));

  if (country && country !== 'ALL') {
    stadiums = stadiums.filter(s => s.country.toLowerCase() === country.toLowerCase());
  }

  stadiums.sort((a, b) => {
    let diff = 0;
    if (sortBy === 'capacity') {
      diff = a.capacity - b.capacity;
    } else if (sortBy === 'name') {
      diff = a.stadiumName.localeCompare(b.stadiumName);
    } else if (sortBy === 'club') {
      diff = a.clubName.localeCompare(b.clubName);
    } else if (sortBy === 'city') {
      diff = a.city.localeCompare(b.city);
    }
    return order === 'desc' ? -diff : diff;
  });

  return stadiums;
}

/**
 * Obtiene el estadio de un equipo por su código (ID).
 */
export function getTeamStadium(clubId: string): TeamStadiumInfo | undefined {
  const club = UCL_CLUBS_DATA[clubId];
  if (!club) return undefined;
  return {
    clubId: club.id,
    clubName: club.name,
    shortName: club.shortName,
    city: club.city,
    country: club.country,
    stadiumName: club.stadium.name,
    capacity: club.stadium.capacity,
    image: stadiumImageSrc(club.id),
    colors: club.colors,
  };
}

/**
 * Calcula estadísticas agregadas de aforo y sedes de la competición.
 */
export function getStadiumStats(): StadiumStats {
  const list = getAllTeamStadiums({ sortBy: 'capacity', order: 'desc' });
  const totalStadiums = list.length;
  const totalCapacity = list.reduce((sum, s) => sum + s.capacity, 0);
  const averageCapacity = totalStadiums > 0 ? Math.round(totalCapacity / totalStadiums) : 0;

  return {
    totalStadiums,
    totalCapacity,
    averageCapacity,
    largestStadium: list[0],
    smallestStadium: list[list.length - 1],
  };
}
