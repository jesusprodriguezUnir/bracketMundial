import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Jordan Pickford', position: 'GK', age: 31, club: 'Everton' },
  { number: 13, name: 'Dean Henderson', position: 'GK', age: 28, club: 'Crystal Palace' },
  { number: 23, name: 'James Trafford', position: 'GK', age: 23, club: 'Manchester City' },
  // Defensores
  { number: 2, name: 'Ezri Konsa', position: 'DF', age: 29, club: 'Aston Villa' },
  { number: 3, name: 'Nico O’Reilly', position: 'DF', age: 21, club: 'Manchester City' },
  { number: 5, name: 'John Stones', position: 'DF', age: 32, club: 'Manchester City' },
  { number: 6, name: 'Marc Guéhi', position: 'DF', age: 26, club: 'Manchester City' },
  { number: 12, name: 'Tino Livramento', position: 'DF', age: 23, club: 'Newcastle' },
  { number: 15, name: 'Dan Burn', position: 'DF', age: 33, club: 'Newcastle' },
  { number: 24, name: 'Reece James', position: 'DF', age: 26, club: 'Chelsea' },
  { number: 25, name: 'Djed Spence', position: 'DF', age: 25, club: 'Tottenham' },
  { number: 26, name: 'Jarell Quansah', position: 'DF', age: 23, club: 'Bayer Leverkusen' },
  // Volantes
  { number: 4, name: 'Declan Rice', position: 'MF', age: 27, club: 'Arsenal' },
  { number: 8, name: 'Elliot Anderson', position: 'MF', age: 24, club: 'Nottingham Forest' },
  { number: 10, name: 'Jude Bellingham', position: 'MF', age: 23, club: 'Real Madrid' },
  { number: 14, name: 'Jordan Henderson', position: 'MF', age: 36, club: 'Brentford' },
  { number: 16, name: 'Kobbie Mainoo', position: 'MF', age: 21, club: 'Manchester United' },
  { number: 17, name: 'Morgan Rogers', position: 'MF', age: 23, club: 'Aston Villa' },
  { number: 21, name: 'Eberechi Eze', position: 'MF', age: 28, club: 'Arsenal' },
  // Delanteros
  { number: 7, name: 'Bukayo Saka', position: 'FW', age: 25, club: 'Arsenal' },
  { number: 9, name: 'Harry Kane', position: 'FW', age: 33, club: 'Bayern Munich', captain: true },
  { number: 11, name: 'Marcus Rashford', position: 'FW', age: 28, club: 'Manchester United' },
  { number: 18, name: 'Anthony Gordon', position: 'FW', age: 25, club: 'Newcastle' },
  { number: 19, name: 'Ollie Watkins', position: 'FW', age: 31, club: 'Aston Villa' },
  { number: 20, name: 'Noni Madueke', position: 'FW', age: 23, club: 'Arsenal' },
  { number: 22, name: 'Ivan Toney', position: 'FW', age: 30, club: 'Al-Ahli' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 24, 6, 5, 15, 4, 16, 18, 10, 7, 9]
};
