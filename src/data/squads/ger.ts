import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Manuel Neuer', position: 'GK', age: 40, club: 'Bayern Munich' },
  { number: 12, name: 'Oliver Baumann', position: 'GK', age: 36, club: 'Hoffenheim' },
  { number: 21, name: 'Alexander Nübel', position: 'GK', age: 29, club: 'Stuttgart' },
  // Defensores
  { number: 2, name: 'Antonio Rüdiger', position: 'DF', age: 33, club: 'Real Madrid' },
  { number: 3, name: 'Waldemar Anton', position: 'DF', age: 29, club: 'Borussia Dortmund' },
  { number: 4, name: 'Jonathan Tah', position: 'DF', age: 29, club: 'Bayern Munich' },
  { number: 6, name: 'Joshua Kimmich', position: 'DF', age: 30, club: 'Bayern Munich', captain: true },
  { number: 15, name: 'Nico Schlotterbeck', position: 'DF', age: 27, club: 'Borussia Dortmund' },
  { number: 18, name: 'Nathaniel Brown', position: 'DF', age: 23, club: 'Eintracht Frankfurt' },
  { number: 22, name: 'David Raum', position: 'DF', age: 27, club: 'RB Leipzig' },
  { number: 24, name: 'Malick Thiaw', position: 'DF', age: 24, club: 'Newcastle' },
  // Volantes
  { number: 5, name: 'Aleksandar Pavlovic', position: 'MF', age: 22, club: 'Bayern Munich' },
  { number: 8, name: 'Leon Goretzka', position: 'MF', age: 31, club: 'Bayern Munich' },
  { number: 9, name: 'Jamie Leweling', position: 'MF', age: 25, club: 'Stuttgart' },
  { number: 10, name: 'Jamal Musiala', position: 'MF', age: 23, club: 'Bayern Munich' },
  { number: 13, name: 'Pascal Gross', position: 'MF', age: 35, club: 'Brighton' },
  { number: 16, name: 'Angelo Stiller', position: 'MF', age: 25, club: 'Stuttgart' },
  { number: 17, name: 'Florian Wirtz', position: 'MF', age: 23, club: 'Liverpool' },
  { number: 20, name: 'Nadiem Amiri', position: 'MF', age: 29, club: 'Mainz' },
  { number: 23, name: 'Felix Nmecha', position: 'MF', age: 25, club: 'Borussia Dortmund' },
  { number: 25, name: 'Lennart Karl', position: 'MF', age: 18, club: 'Bayern Munich' },
  // Delanteros
  { number: 7, name: 'Kai Havertz', position: 'FW', age: 26, club: 'Arsenal' },
  { number: 11, name: 'Nick Woltemade', position: 'FW', age: 23, club: 'Newcastle' },
  { number: 14, name: 'Maximilian Beier', position: 'FW', age: 23, club: 'Borussia Dortmund' },
  { number: 19, name: 'Leroy Sané', position: 'FW', age: 29, club: 'Galatasaray' },
  { number: 26, name: 'Deniz Undav', position: 'FW', age: 29, club: 'Stuttgart' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 6, 4, 15, 22, 5, 16, 17, 10, 19, 7]
};
