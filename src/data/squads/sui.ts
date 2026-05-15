import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Gregor Kobel',           position: 'GK', age: 28, club: 'Borussia Dortmund' },
  { number: 12, name: 'Yvon Mvogo',             position: 'GK', age: 31, club: 'Lorient' },
  { number: 21, name: 'Marvin Keller',          position: 'GK', age: 23, club: 'Young Boys' },
  { number: 2,  name: 'Silvan Widmer',          position: 'DF', age: 33, club: 'Mainz' },
  { number: 3,  name: 'Ricardo Rodríguez',      position: 'DF', age: 33, club: 'Real Betis' },
  { number: 4,  name: 'Nico Elvedi',            position: 'DF', age: 29, club: 'Borussia M\'gladbach' },
  { number: 5,  name: 'Manuel Akanji',          position: 'DF', age: 30, club: 'Manchester City' },
  { number: 13, name: 'Eray Cömert',            position: 'DF', age: 28, club: 'Real Valladolid' },
  { number: 22, name: 'Miro Muheim',            position: 'DF', age: 28, club: 'Hamburger SV' },
  { number: 15, name: 'Aurèle Amenda',          position: 'DF', age: 22, club: 'Eintracht Frankfurt' },
  { number: 25, name: 'Luca Jaquez',            position: 'DF', age: 22, club: 'Luzern' },
  { number: 6,  name: 'Denis Zakaria',          position: 'MF', age: 29, club: 'Monaco' },
  { number: 8,  name: 'Remo Freuler',           position: 'MF', age: 34, club: 'Bologna' },
  { number: 10, name: 'Granit Xhaka',           position: 'MF', age: 33, club: 'Bayer Leverkusen', captain: true },
  { number: 14, name: 'Djibril Sow',            position: 'MF', age: 29, club: 'Sevilla' },
  { number: 26, name: 'Fabian Rieder',          position: 'MF', age: 24, club: 'Stuttgart' },
  { number: 16, name: 'Vincent Sierro',         position: 'MF', age: 30, club: 'Toulouse' },
  { number: 24, name: 'Ardon Jashari',          position: 'MF', age: 23, club: 'Club Brugge' },
  { number: 23, name: 'Alvyn Sanches',          position: 'MF', age: 23, club: 'Lausanne-Sport' },
  { number: 17, name: 'Michel Aebischer',       position: 'MF', age: 29, club: 'Bologna' },
  { number: 20, name: 'Johan Manzambi',         position: 'MF', age: 20, club: 'SC Freiburg' },
  { number: 7,  name: 'Breel Embolo',           position: 'FW', age: 29, club: 'Monaco' },
  { number: 19, name: 'Dan Ndoye',              position: 'FW', age: 25, club: 'Bologna' },
  { number: 11, name: 'Ruben Vargas',           position: 'FW', age: 27, club: 'Augsburg' },
  { number: 18, name: 'Joël Monteiro',          position: 'FW', age: 26, club: 'Young Boys' },
  { number: 9,  name: 'Noah Okafor',            position: 'FW', age: 26, club: 'AC Milan' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 4, 3, 10, 8, 6, 19, 7, 11]
};

