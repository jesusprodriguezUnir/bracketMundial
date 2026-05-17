import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Jordan Pickford', position: 'GK', age: 32, club: 'Everton' },
  { number: 13, name: 'Aaron Ramsdale', position: 'GK', age: 28, club: 'Newcastle United' },
  { number: 23, name: 'Dean Henderson', position: 'GK', age: 29, club: 'Crystal Palace' },
  { number: 2, name: 'Kyle Walker', position: 'DF', age: 36, club: 'Manchester City' },
  { number: 3, name: 'Luke Shaw', position: 'DF', age: 31, club: 'Manchester United' },
  { number: 4, name: 'John Stones', position: 'DF', age: 32, club: 'Manchester City' },
  { number: 5, name: 'Marc Guéhi', position: 'DF', age: 26, club: 'Manchester City' },
  { number: 6, name: 'Lewis Dunk', position: 'DF', age: 34, club: 'Brighton' },
  { number: 14, name: 'Ezri Konsa', position: 'DF', age: 29, club: 'Aston Villa' },
  { number: 16, name: 'Joe Gomez', position: 'DF', age: 29, club: 'Liverpool' },
  { number: 17, name: 'Kieran Trippier', position: 'DF', age: 35, club: 'Newcastle United' },
  { number: 11, name: 'Trent Alexander-Arnold', position: 'MF', age: 27, club: 'Real Madrid' },
  { number: 12, name: 'Reece James', position: 'MF', age: 26, club: 'Chelsea' },
  { number: 8, name: 'Declan Rice', position: 'MF', age: 27, club: 'Arsenal', captain: true },
  { number: 15, name: 'Adam Wharton', position: 'MF', age: 22, club: 'Crystal Palace' },
  { number: 18, name: 'Kobbie Mainoo', position: 'MF', age: 21, club: 'Manchester United' },
  { number: 10, name: 'Jude Bellingham', position: 'FW', age: 23, club: 'Real Madrid' },
  { number: 9, name: 'Harry Kane', position: 'FW', age: 33, club: 'Bayern Munich' },
  { number: 7, name: 'Bukayo Saka', position: 'FW', age: 25, club: 'Arsenal' },
  { number: 19, name: 'Cole Palmer', position: 'FW', age: 24, club: 'Chelsea' },
  { number: 20, name: 'Anthony Gordon', position: 'FW', age: 25, club: 'Newcastle United' },
  { number: 21, name: 'Jarrod Bowen', position: 'FW', age: 29, club: 'West Ham' },
  { number: 22, name: 'Ollie Watkins', position: 'FW', age: 31, club: 'Aston Villa' },
  { number: 24, name: 'Eberechi Eze', position: 'FW', age: 28, club: 'Arsenal' },
  { number: 25, name: 'Phil Foden', position: 'FW', age: 26, club: 'Manchester City' },
  { number: 26, name: 'Mason Greenwood', position: 'FW', age: 24, club: 'Marseille' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 3, 5, 4, 2, 8, 18, 25, 10, 7, 9]
};
