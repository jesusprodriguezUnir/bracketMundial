import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Jordan Pickford', position: 'GK', age: 32, club: 'Everton' },
  { number: 13, name: 'Aaron Ramsdale', position: 'GK', age: 28, club: 'Southampton' },
  { number: 23, name: 'Dean Henderson', position: 'GK', age: 29, club: 'Crystal Palace' },
  { number: 26, name: 'James Trafford', position: 'GK', age: 24, club: 'Burnley' },
  { number: 2, name: 'Kyle Walker', position: 'DF', age: 36, club: 'Manchester City' },
  { number: 3, name: 'Luke Shaw', position: 'DF', age: 31, club: 'Manchester United' },
  { number: 4, name: 'John Stones', position: 'DF', age: 32, club: 'Manchester City' },
  { number: 5, name: 'Marc Guéhi', position: 'DF', age: 26, club: 'Manchester City' },
  { number: 6, name: 'Lewis Dunk', position: 'DF', age: 34, club: 'Brighton' },
  { number: 14, name: 'Ezri Konsa', position: 'DF', age: 29, club: 'Aston Villa' },
  { number: 16, name: 'Joe Gomez', position: 'DF', age: 29, club: 'Liverpool' },
  { number: 24, name: 'Tino Livramento', position: 'DF', age: 22, club: 'Newcastle United' },
  { number: 25, name: 'Lewis Hall', position: 'DF', age: 20, club: 'Newcastle United' },
  { number: 27, name: 'Dan Burn', position: 'DF', age: 34, club: 'Newcastle United' },
  { number: 8, name: 'Declan Rice', position: 'MF', age: 27, club: 'Arsenal', captain: true },
  { number: 15, name: 'Adam Wharton', position: 'MF', age: 22, club: 'Crystal Palace' },
  { number: 18, name: 'Kobbie Mainoo', position: 'MF', age: 21, club: 'Manchester United' },
  { number: 28, name: 'Elliot Anderson', position: 'MF', age: 22, club: 'Nottingham Forest' },
  { number: 29, name: 'Jordan Henderson', position: 'MF', age: 36, club: 'Ajax' },
  { number: 30, name: 'Morgan Rogers', position: 'MF', age: 23, club: 'Aston Villa' },
  { number: 10, name: 'Jude Bellingham', position: 'FW', age: 23, club: 'Real Madrid' },
  { number: 9, name: 'Harry Kane', position: 'FW', age: 33, club: 'Bayern Munich' },
  { number: 7, name: 'Bukayo Saka', position: 'FW', age: 25, club: 'Arsenal' },
  { number: 19, name: 'Cole Palmer', position: 'FW', age: 24, club: 'Chelsea' },
  { number: 20, name: 'Anthony Gordon', position: 'FW', age: 25, club: 'Newcastle United' },
  { number: 21, name: 'Jarrod Bowen', position: 'FW', age: 29, club: 'West Ham' },
  { number: 22, name: 'Ollie Watkins', position: 'FW', age: 31, club: 'Aston Villa' },
  { number: 31, name: 'Noni Madueke', position: 'FW', age: 23, club: 'Chelsea' },
  { number: 32, name: 'Marcus Rashford', position: 'FW', age: 29, club: 'Barcelona' },
  { number: 12, name: 'Reece James', position: 'DF', age: 26, club: 'Chelsea' },
  { number: 17, name: 'Nico O\'Reilly', position: 'DF', age: 21, club: 'Manchester City' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 12, 4, 5, 17, 8, 28, 7, 10, 32, 9]
};
