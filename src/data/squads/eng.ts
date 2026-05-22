import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Jordan Pickford', position: 'GK', age: 32, club: 'Everton' },
  { number: 13, name: 'James Trafford', position: 'GK', age: 23, club: 'Manchester City' },
  { number: 23, name: 'Dean Henderson', position: 'GK', age: 29, club: 'Crystal Palace' },

  // Defensas
  { number: 2, name: 'Tino Livramento', position: 'DF', age: 23, club: 'Newcastle United' },
  { number: 3, name: 'Dan Burn', position: 'DF', age: 34, club: 'Newcastle United' },
  { number: 4, name: 'John Stones', position: 'DF', age: 32, club: 'Manchester City' },
  { number: 5, name: 'Marc Guéhi', position: 'DF', age: 26, club: 'Manchester City' },
  { number: 6, name: 'Jarell Quansah', position: 'DF', age: 23, club: 'Bayer Leverkusen' },
  { number: 12, name: 'Reece James', position: 'DF', age: 26, club: 'Chelsea' },
  { number: 14, name: 'Ezri Konsa', position: 'DF', age: 29, club: 'Aston Villa' },
  { number: 16, name: 'Nico O\'Reilly', position: 'DF', age: 21, club: 'Manchester City' },
  { number: 17, name: 'Djed Spence', position: 'DF', age: 25, club: 'Tottenham Hotspur' },

  // Centrocampistas
  { number: 8, name: 'Declan Rice', position: 'MF', age: 27, club: 'Arsenal' },
  { number: 11, name: 'Elliot Anderson', position: 'MF', age: 23, club: 'Nottingham Forest' },
  { number: 15, name: 'Jordan Henderson', position: 'MF', age: 36, club: 'Brentford' },
  { number: 18, name: 'Kobbie Mainoo', position: 'MF', age: 21, club: 'Manchester United' },
  { number: 21, name: 'Morgan Rogers', position: 'MF', age: 23, club: 'Aston Villa' },
  { number: 24, name: 'Eberechi Eze', position: 'MF', age: 28, club: 'Arsenal' },

  // Delanteros
  { number: 7, name: 'Bukayo Saka', position: 'FW', age: 25, club: 'Arsenal' },
  { number: 9, name: 'Harry Kane', position: 'FW', age: 33, club: 'Bayern Munich', captain: true },
  { number: 10, name: 'Jude Bellingham', position: 'FW', age: 23, club: 'Real Madrid' },
  { number: 19, name: 'Noni Madueke', position: 'FW', age: 24, club: 'Arsenal' },
  { number: 20, name: 'Anthony Gordon', position: 'FW', age: 25, club: 'Newcastle United' },
  { number: 22, name: 'Ollie Watkins', position: 'FW', age: 31, club: 'Aston Villa' },
  { number: 25, name: 'Marcus Rashford', position: 'FW', age: 28, club: 'FC Barcelona' },
  { number: 26, name: 'Ivan Toney', position: 'FW', age: 30, club: 'Al-Ahli' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 12, 5, 4, 3, 8, 18, 20, 10, 7, 9]
};
