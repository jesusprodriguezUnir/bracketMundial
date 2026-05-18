import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Bart Verbruggen',        position: 'GK', age: 24, club: 'Brighton' },
  { number: 23, name: 'Mark Flekken',           position: 'GK', age: 31, club: 'Brentford' },
  { number: 13, name: 'Justin Bijlow',          position: 'GK', age: 28, club: 'Feyenoord' },
  { number: 4,  name: 'Virgil van Dijk',        position: 'DF', age: 35, club: 'Liverpool', captain: true },
  { number: 26, name: 'Jurriën Timber',         position: 'DF', age: 25, club: 'Arsenal' },
  { number: 12, name: 'Jeremie Frimpong',       position: 'DF', age: 26, club: 'Liverpool' },
  { number: 22, name: 'Denzel Dumfries',        position: 'DF', age: 30, club: 'Inter Milan' },
  { number: 3,  name: 'Jan Paul van Hecke',     position: 'DF', age: 26, club: 'Brighton' },
  { number: 15, name: 'Micky van de Ven',       position: 'DF', age: 25, club: 'Tottenham Hotspur' },
  { number: 2,  name: 'Lutsharel Geertruida',   position: 'DF', age: 25, club: 'RB Leipzig' },
  { number: 25, name: 'Jorrel Hato',            position: 'DF', age: 19, club: 'Ajax' },
  { number: 6,  name: 'Stefan de Vrij',         position: 'DF', age: 34, club: 'Inter Milan' },
  { number: 5,  name: 'Nathan Aké',             position: 'DF', age: 31, club: 'Manchester City' },
  { number: 14, name: 'Tijjani Reijnders',      position: 'MF', age: 28, club: 'Manchester City' },
  { number: 10, name: 'Memphis Depay',          position: 'MF', age: 32, club: 'Corinthians' },
  { number: 20, name: 'Teun Koopmeiners',       position: 'MF', age: 28, club: 'Juventus' },
  { number: 8,  name: 'Ryan Gravenberch',       position: 'MF', age: 24, club: 'Liverpool' },
  { number: 21, name: 'Kees Smit',              position: 'MF', age: 22, club: 'AZ Alkmaar' },
  { number: 26, name: 'Quinten Timber',         position: 'MF', age: 25, club: 'Feyenoord' },
  { number: 16, name: 'Joey Schouten',          position: 'MF', age: 28, club: 'PSV' },
  { number: 10, name: 'Luciano Valente',        position: 'MF', age: 23, club: 'Groningen' },
  { number: 11, name: 'Cody Gakpo',             position: 'FW', age: 27, club: 'Liverpool' },
  { number: 18, name: 'Donyell Malen',          position: 'FW', age: 27, club: 'Aston Villa' },
  { number: 17, name: 'Noa Lang',               position: 'FW', age: 26, club: 'PSV' },
  { number: 19, name: 'Brian Brobbey',          position: 'FW', age: 24, club: 'Ajax' },
  { number: 9,  name: 'Wout Weghorst',          position: 'FW', age: 34, club: 'Ajax' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 22, 4, 5, 12, 14, 8, 21, 11, 10, 18]
};
