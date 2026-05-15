import type { Player } from './index';

export const squad: Player[] = [
  { number: 1,  name: 'Matěj Kovář',           position: 'GK', age: 26, club: 'PSV' },
  { number: 12, name: 'Jindřich Staněk',       position: 'GK', age: 30, club: 'Slavia Prague' },
  { number: 23, name: 'Antonín Kinský',       position: 'GK', age: 23, club: 'Tottenham Hotspur' },
  { number: 2,  name: 'Vladimír Coufal',      position: 'DF', age: 33, club: 'TSG Hoffenheim' },
  { number: 3,  name: 'David Jurásek',        position: 'DF', age: 25, club: 'Slavia Prague' },
  { number: 4,  name: 'Tomáš Holeš',          position: 'DF', age: 33, club: 'Slavia Prague' },
  { number: 5,  name: 'Ladislav Krejčí',      position: 'DF', age: 27, club: 'Wolverhampton Wanderers', captain: true },
  { number: 15, name: 'David Zima',           position: 'DF', age: 25, club: 'Slavia Prague' },
  { number: 16, name: 'Robin Hranáč',         position: 'DF', age: 26, club: 'TSG Hoffenheim' },
  { number: 17, name: 'Martin Vitík',         position: 'DF', age: 23, club: 'Bologna' },
  { number: 18, name: 'David Douděra',        position: 'DF', age: 27, club: 'Slavia Prague' },
  { number: 22, name: 'Jaroslav Zelený',      position: 'DF', age: 33, club: 'Sparta Prague' },
  { number: 6,  name: 'Tomáš Souček',         position: 'MF', age: 31, club: 'West Ham United' },
  { number: 14, name: 'Pavel Šulc',           position: 'MF', age: 25, club: 'Olympique Lyon' },
  { number: 19, name: 'Adam Karabec',         position: 'MF', age: 22, club: 'Olympique Lyon' },
  { number: 7,  name: 'Lukáš Provod',         position: 'MF', age: 29, club: 'Slavia Prague' },
  { number: 21, name: 'Lukáš Červ',           position: 'MF', age: 25, club: 'Viktoria Plzeň' },
  { number: 8,  name: 'Michal Sadílek',       position: 'MF', age: 26, club: 'Slavia Prague' },
  { number: 20, name: 'Kryštof Daněk',        position: 'MF', age: 23, club: 'Sparta Prague' },
  { number: 13, name: 'Pavel Bucha',          position: 'MF', age: 28, club: 'Cincinnati' },
  { number: 10, name: 'Patrik Schick',        position: 'FW', age: 30, club: 'Bayer Leverkusen' },
  { number: 9,  name: 'Adam Hložek',          position: 'FW', age: 23, club: 'Hoffenheim' },
  { number: 11, name: 'Václav Černý',         position: 'FW', age: 28, club: 'Wolfsburg' },
  { number: 24, name: 'Tomáš Chorý',          position: 'FW', age: 31, club: 'Slavia Prague' },
  { number: 25, name: 'Jan Kuchta',           position: 'FW', age: 29, club: 'Midtjylland' },
  { number: 26, name: 'Mojmír Chytil',        position: 'FW', age: 27, club: 'Slavia Prague' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 6, 8, 11, 14, 7, 10]
};
