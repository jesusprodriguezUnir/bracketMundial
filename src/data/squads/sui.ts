import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Yann Sommer',            position: 'GK', age: 37, club: 'Inter Milan', captain: true },
  { number: 12, name: 'Gregor Kobel',           position: 'GK', age: 28, club: 'Borussia Dortmund' },
  { number: 21, name: 'Philipp Köhn',           position: 'GK', age: 27, club: 'Monaco' },
  { number: 2,  name: 'Silvan Widmer',          position: 'DF', age: 31, club: 'Mainz' },
  { number: 3,  name: 'Ricardo Rodríguez',      position: 'DF', age: 33, club: 'Torino' },
  { number: 4,  name: 'Nico Elvedi',            position: 'DF', age: 29, club: 'Borussia M\'gladbach' },
  { number: 5,  name: 'Manuel Akanji',          position: 'DF', age: 30, club: 'Manchester City' },
  { number: 13, name: 'Fabian Schär',           position: 'DF', age: 33, club: 'Newcastle' },
  { number: 22, name: 'Kevin Mbabu',            position: 'DF', age: 29, club: 'Augsburg' },
  { number: 6,  name: 'Denis Zakaria',          position: 'MF', age: 29, club: 'Monaco' },
  { number: 8,  name: 'Remo Freuler',           position: 'MF', age: 32, club: 'Nottingham Forest' },
  { number: 10, name: 'Granit Xhaka',           position: 'MF', age: 33, club: 'Bayer Leverkusen' },
  { number: 11, name: 'Ruben Vargas',           position: 'FW', age: 26, club: 'Augsburg' },
  { number: 15, name: 'Djibril Sow',            position: 'MF', age: 28, club: 'Sevilla' },
  { number: 17, name: 'Renato Steffen',         position: 'MF', age: 32, club: 'Lugano' },
  { number: 14, name: 'Michel Aebischer',       position: 'MF', age: 28, club: 'Bologna' },
  { number: 16, name: 'Fabian Frei',            position: 'MF', age: 37, club: 'Basel' },
  { number: 7,  name: 'Breel Embolo',           position: 'FW', age: 29, club: 'Monaco' },
  { number: 9,  name: 'Haris Seferović',        position: 'FW', age: 33, club: 'Galatasaray' },
  { number: 18, name: 'Noah Okafor',            position: 'FW', age: 25, club: 'AC Milan' },
  { number: 19, name: 'Dan Ndoye',              position: 'FW', age: 24, club: 'Bologna' },
  { number: 20, name: 'Kwadwo Duah',            position: 'FW', age: 27, club: 'Nürnberg' },
  { number: 23, name: 'Zeki Amdouni',           position: 'FW', age: 25, club: 'Burnley' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 13, 5, 3, 10, 8, 6, 11, 7, 18]
};

