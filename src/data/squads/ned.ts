import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Bart Verbruggen',        position: 'GK', age: 22, club: 'Brighton' },
  { number: 13, name: 'Mark Flekken',           position: 'GK', age: 31, club: 'Brentford' },
  { number: 23, name: 'Remko Pasveer',          position: 'GK', age: 40, club: 'Ajax' },
  { number: 2,  name: 'Denzel Dumfries',        position: 'DF', age: 29, club: 'Inter Milan' },
  { number: 3,  name: 'Matthijs de Ligt',       position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 4,  name: 'Virgil van Dijk',        position: 'DF', age: 35, club: 'Liverpool', captain: true },
  { number: 5,  name: 'Nathan Aké',             position: 'DF', age: 31, club: 'Manchester City' },
  { number: 15, name: 'Stefan de Vrij',         position: 'DF', age: 34, club: 'Inter Milan' },
  { number: 22, name: 'Daley Blind',            position: 'DF', age: 35, club: 'Girona' },
  { number: 20, name: 'Ian Maatsen',            position: 'DF', age: 22, club: 'Chelsea' },
  { number: 6,  name: 'Teun Koopmeiners',       position: 'MF', age: 28, club: 'Juventus' },
  { number: 8,  name: 'Ryan Gravenberch',       position: 'MF', age: 23, club: 'Liverpool' },
  { number: 10, name: 'Memphis Depay',          position: 'FW', age: 32, club: 'Corinthians' },
  { number: 14, name: 'Davy Klaassen',          position: 'MF', age: 33, club: 'Ajax' },
  { number: 16, name: 'Tijjani Reijnders',      position: 'MF', age: 26, club: 'AC Milan' },
  { number: 17, name: 'Xavi Simons',            position: 'MF', age: 23, club: 'RB Leipzig' },
  { number: 18, name: 'Mats Wieffer',           position: 'MF', age: 25, club: 'Brighton' },
  { number: 7,  name: 'Steven Bergwijn',        position: 'FW', age: 28, club: 'Ajax' },
  { number: 9,  name: 'Wout Weghorst',          position: 'FW', age: 33, club: 'Hoffenheim' },
  { number: 11, name: 'Cody Gakpo',             position: 'FW', age: 26, club: 'Liverpool' },
  { number: 19, name: 'Brian Brobbey',          position: 'FW', age: 24, club: 'Ajax' },
  { number: 21, name: 'Donyell Malen',          position: 'FW', age: 27, club: 'Borussia Dortmund' },
  { number: 24, name: 'Joshua Zirkzee',         position: 'FW', age: 25, club: 'Manchester United' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 3, 16, 6, 17, 11, 10, 21]
};
