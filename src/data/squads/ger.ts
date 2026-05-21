import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Manuel Neuer', position: 'GK', age: 40, club: 'Bayern Munich' },
  { number: 12, name: 'Oliver Baumann', position: 'GK', age: 35, club: 'Hoffenheim' },
  { number: 22, name: 'Alexander Nübel', position: 'GK', age: 29, club: 'VfB Stuttgart' },
  { number: 2, name: 'Joshua Kimmich', position: 'DF', age: 31, club: 'Bayern Munich', captain: true },
  { number: 3, name: 'David Raum', position: 'DF', age: 27, club: 'RB Leipzig' },
  { number: 4, name: 'Jonathan Tah', position: 'DF', age: 30, club: 'Bayern Munich' },
  { number: 5, name: 'Nico Schlotterbeck', position: 'DF', age: 26, club: 'Borussia Dortmund' },
  { number: 13, name: 'Antonio Rüdiger', position: 'DF', age: 33, club: 'Real Madrid' },
  { number: 15, name: 'Waldemar Anton', position: 'DF', age: 29, club: 'Borussia Dortmund' },
  { number: 17, name: 'Nathaniel Brown', position: 'DF', age: 23, club: 'Eintracht Frankfurt' },
  { number: 24, name: 'Malick Thiaw', position: 'DF', age: 24, club: 'Newcastle' },
  { number: 6, name: 'Leon Goretzka', position: 'MF', age: 31, club: 'Bayern Munich' },
  { number: 8, name: 'Aleksandar Pavlović', position: 'MF', age: 21, club: 'Bayern Munich' },
  { number: 10, name: 'Florian Wirtz', position: 'MF', age: 23, club: 'Liverpool' },
  { number: 16, name: 'Leroy Sané', position: 'MF', age: 30, club: 'Galatasaray' },
  { number: 18, name: 'Pascal Groß', position: 'MF', age: 35, club: 'Brighton' },
  { number: 20, name: 'Jamie Leweling', position: 'MF', age: 25, club: 'VfB Stuttgart' },
  { number: 21, name: 'Nadiem Amiri', position: 'MF', age: 29, club: 'Mainz 05' },
  { number: 28, name: 'Felix Nmecha', position: 'MF', age: 24, club: 'Borussia Dortmund' },
  { number: 29, name: 'Angelo Stiller', position: 'MF', age: 24, club: 'VfB Stuttgart' },
  { number: 7, name: 'Kai Havertz', position: 'FW', age: 27, club: 'Arsenal' },
  { number: 9, name: 'Maximilian Beier', position: 'FW', age: 23, club: 'Borussia Dortmund' },
  { number: 11, name: 'Deniz Undav', position: 'FW', age: 29, club: 'Stuttgart' },
  { number: 14, name: 'Jamal Musiala', position: 'FW', age: 23, club: 'Bayern Munich' },
  { number: 19, name: 'Nick Woltemade', position: 'FW', age: 23, club: 'Newcastle' },
  { number: 23, name: 'Lennart Karl', position: 'FW', age: 18, club: 'Bayern Munich' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 8, 29, 10, 14, 16, 7]
};
