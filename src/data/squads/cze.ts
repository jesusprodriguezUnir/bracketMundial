import type { Player } from './index';

export const squad: Player[] = [
  { number: 1,  name: 'Matěj Kovář',           position: 'GK', age: 26, club: 'PSV Eindhoven' },
  { number: 12, name: 'Jindřich Staněk',       position: 'GK', age: 30, club: 'Slavia Prague' },
  { number: 23, name: 'Lukáš Horníček',        position: 'GK', age: 23, club: 'SC Braga' },

  { number: 2,  name: 'Vladimír Coufal',      position: 'DF', age: 33, club: 'TSG 1899 Hoffenheim' },
  { number: 3,  name: 'David Jurásek',        position: 'DF', age: 25, club: 'Slavia Prague' },
  { number: 4,  name: 'Tomáš Holeš',          position: 'DF', age: 33, club: 'Slavia Prague' },
  { number: 5,  name: 'Ladislav Krejčí',      position: 'DF', age: 27, club: 'Wolverhampton Wanderers', captain: true },
  { number: 15, name: 'David Zima',           position: 'DF', age: 25, club: 'Slavia Prague' },
  { number: 16, name: 'Robin Hranáč',         position: 'DF', age: 26, club: 'TSG 1899 Hoffenheim' },
  { number: 17, name: 'Štěpán Chaloupek',      position: 'DF', age: 23, club: 'Slavia Prague' },
  { number: 22, name: 'Jaroslav Zelený',      position: 'DF', age: 33, club: 'Sparta Prague' },

  { number: 6,  name: 'Tomáš Souček',         position: 'MF', age: 31, club: 'West Ham United' },
  { number: 8,  name: 'Vladimír Darida',       position: 'MF', age: 35, club: 'FC Hradec Králové' },
  { number: 13, name: 'Alexandr Sojka',        position: 'MF', age: 23, club: 'Viktoria Plzeň' },
  { number: 14, name: 'Pavel Šulc',           position: 'MF', age: 25, club: 'Olympique Lyonnais' },
  { number: 18, name: 'David Douděra',        position: 'MF', age: 28, club: 'Slavia Prague' },
  { number: 19, name: 'Michal Sadílek',        position: 'MF', age: 27, club: 'Slavia Prague' },
  { number: 20, name: 'Hugo Sochůrek',         position: 'MF', age: 17, club: 'Sparta Prague' },
  { number: 21, name: 'Lukáš Červ',           position: 'MF', age: 25, club: 'Viktoria Plzeň' },
  { number: 26, name: 'Denis Višinský',        position: 'MF', age: 23, club: 'Viktoria Plzeň' },

  { number: 7,  name: 'Lukáš Provod',         position: 'FW', age: 29, club: 'Slavia Prague' },
  { number: 9,  name: 'Adam Hložek',          position: 'FW', age: 23, club: 'TSG 1899 Hoffenheim' },
  { number: 10, name: 'Patrik Schick',        position: 'FW', age: 30, club: 'Bayer 04 Leverkusen' },
  { number: 11, name: 'Mojmír Chytil',        position: 'FW', age: 27, club: 'Slavia Prague' },
  { number: 24, name: 'Tomáš Chorý',          position: 'FW', age: 31, club: 'Slavia Prague' },
  { number: 25, name: 'Jan Kuchta',           position: 'FW', age: 29, club: 'Sparta Prague' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 6, 8, 14, 7, 9, 10]
};
