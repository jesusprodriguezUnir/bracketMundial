import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Bart Verbruggen',        position: 'GK', age: 24, club: 'Brighton' },
  { number: 13, name: 'Mark Flekken',           position: 'GK', age: 31, club: 'Brentford' },
  { number: 23, name: 'Remko Pasveer',          position: 'GK', age: 40, club: 'Ajax' },
  { number: 2,  name: 'Denzel Dumfries',        position: 'DF', age: 30, club: 'Inter Milan' },
  { number: 3,  name: 'Matthijs de Ligt',       position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 4,  name: 'Virgil van Dijk',        position: 'DF', age: 35, club: 'Liverpool', captain: true },
  { number: 5,  name: 'Nathan Aké',             position: 'DF', age: 31, club: 'Manchester City' },
  { number: 12, name: 'Jurriën Timber',         position: 'DF', age: 25, club: 'Arsenal' },
  { number: 15, name: 'Micky van de Ven',       position: 'DF', age: 25, club: 'Tottenham Hotspur' },
  { number: 22, name: 'Jeremie Frimpong',       position: 'DF', age: 26, club: 'Liverpool' },
  { number: 25, name: 'Jan Paul van Hecke',     position: 'DF', age: 26, club: 'Brighton' },
  { number: 6,  name: 'Teun Koopmeiners',       position: 'MF', age: 28, club: 'Juventus' },
  { number: 8,  name: 'Ryan Gravenberch',       position: 'MF', age: 24, club: 'Liverpool' },
  { number: 21, name: 'Frenkie de Jong',        position: 'MF', age: 29, club: 'Barcelona' },
  { number: 14, name: 'Davy Klaassen',          position: 'MF', age: 33, club: 'Ajax' },
  { number: 16, name: 'Tijjani Reijnders',      position: 'MF', age: 28, club: 'Manchester City' },
  { number: 17, name: 'Xavi Simons',            position: 'MF', age: 23, club: 'Tottenham Hotspur' },
  { number: 18, name: 'Mats Wieffer',           position: 'MF', age: 25, club: 'Brighton' },
  { number: 7,  name: 'Justin Kluivert',        position: 'FW', age: 27, club: 'Bournemouth' },
  { number: 9,  name: 'Wout Weghorst',          position: 'FW', age: 34, club: 'Ajax' },
  { number: 10, name: 'Memphis Depay',          position: 'FW', age: 32, club: 'Corinthians' },
  { number: 11, name: 'Cody Gakpo',             position: 'FW', age: 27, club: 'Liverpool' },
  { number: 19, name: 'Brian Brobbey',          position: 'FW', age: 24, club: 'Ajax' },
  { number: 20, name: 'Donyell Malen',          position: 'FW', age: 27, club: 'Aston Villa' },
  { number: 24, name: 'Joshua Zirkzee',         position: 'FW', age: 25, club: 'Manchester United' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 3, 21, 6, 16, 11, 10, 20]
};
