import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Matej Kovar', position: 'GK', age: 26, club: 'PSV Eindhoven' },
  { number: 16, name: 'Jindrich Stanek', position: 'GK', age: 30, club: 'Slavia Prague' },
  { number: 23, name: 'Lukas Hornicek', position: 'GK', age: 23, club: 'Braga' },
  // Defensores
  { number: 2, name: 'David Zima', position: 'DF', age: 25, club: 'Slavia Prague' },
  { number: 3, name: 'Tomas Holes', position: 'DF', age: 33, club: 'Slavia Prague' },
  { number: 4, name: 'Robin Hranac', position: 'DF', age: 26, club: 'Hoffenheim' },
  { number: 5, name: 'Vladimir Coufal', position: 'DF', age: 33, club: 'Hoffenheim' },
  { number: 6, name: 'Stepan Chaloupek', position: 'DF', age: 22, club: 'Slavia Prague' },
  { number: 7, name: 'Ladislav Krejci', position: 'DF', age: 27, club: 'Wolves', captain: true },
  { number: 14, name: 'David Jurasek', position: 'DF', age: 25, club: 'Slavia Prague' },
  { number: 20, name: 'Jaroslav Zeleny', position: 'DF', age: 33, club: 'Sparta Prague' },
  { number: 21, name: 'David Doudera', position: 'DF', age: 28, club: 'Slavia Prague' },
  // Volantes
  { number: 8, name: 'Vladimír Darida', position: 'MF', age: 35, club: 'Hradec Kralove' },
  { number: 12, name: 'Lukas Cerv', position: 'MF', age: 24, club: 'Viktoria Plzen' },
  { number: 15, name: 'Pavel Sulc', position: 'MF', age: 25, club: 'Lyon' },
  { number: 18, name: 'Michal Sadilek', position: 'MF', age: 27, club: 'Slavia Prague' },
  { number: 22, name: 'Tomas Soucek', position: 'MF', age: 31, club: 'West Ham' },
  { number: 24, name: 'Alexandr Sojka', position: 'MF', age: 23, club: 'Viktoria Plzen' },
  { number: 25, name: 'Hugo Sochurek', position: 'MF', age: 17, club: 'Sparta Prague' },
  { number: 26, name: 'Denis Visinsky', position: 'MF', age: 23, club: 'Viktoria Plzen' },
  // Delanteros
  { number: 9, name: 'Adam Hlozek', position: 'FW', age: 23, club: 'Hoffenheim' },
  { number: 10, name: 'Patrik Schick', position: 'FW', age: 30, club: 'Bayer Leverkusen' },
  { number: 11, name: 'Jan Kuchta', position: 'FW', age: 28, club: 'Sparta Prague' },
  { number: 13, name: 'Mojmir Chytil', position: 'FW', age: 27, club: 'Slavia Prague' },
  { number: 17, name: 'Lukas Provod', position: 'FW', age: 29, club: 'Slavia Prague' },
  { number: 19, name: 'Tomas Chory', position: 'FW', age: 31, club: 'Slavia Prague' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 5, 3, 7, 14, 22, 8, 15, 17, 9, 10]
};
