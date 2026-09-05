import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Jean Butez', position: 'GK', age: 31, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250074004.jpg' },
  { number: 97, name: 'Robert Sánchez', position: 'GK', age: 28, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154983.jpg' },
  // Defensores
  { number: 2, name: 'Marc-Oliver Kempf', position: 'DF', age: 31, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250046524.jpg' },
  { number: 3, name: 'Alex Valle', position: 'DF', age: 22, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164785.jpg' },
  { number: 4, name: 'Jacobo Ramón', position: 'DF', age: 21, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176488.jpg' },
  { number: 13, name: 'Alberto Dossena', position: 'DF', age: 27, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223139.jpg' },
  { number: 16, name: 'Kaiki Bruno', position: 'DF', age: 23, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218352.jpg' },
  { number: 27, name: 'Yan Couto', position: 'DF', age: 24, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163731.jpg' },
  { number: 28, name: 'Ivan Smolčić', position: 'DF', age: 26, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113686.jpg' },
  { number: 99, name: 'Trevoh Chalobah', position: 'DF', age: 27, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076233.jpg' },
  // Centrocampistas
  { number: 5, name: 'Máximo Perrone', position: 'MF', age: 23, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250182150.jpg' },
  { number: 6, name: 'Luis Milla', position: 'MF', age: 31, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250063509.jpg' },
  { number: 7, name: 'Lucas Da Cunha', position: 'MF', age: 25, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116003.jpg' },
  { number: 10, name: 'Nicolás Paz', position: 'MF', age: 21, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153621.jpg' },
  { number: 20, name: 'Martin Baturina', position: 'MF', age: 23, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250140940.jpg' },
  { number: 21, name: 'Samuele Ricci', position: 'MF', age: 25, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117839.jpg' },
  { number: 30, name: 'Mattia Liberali', position: 'MF', age: 19, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250182962.jpg' },
  // Delanteros
  { number: 9, name: 'Tasos Douvikas', position: 'FW', age: 27, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116683.jpg' },
  { number: 11, name: 'Assane Diao', position: 'FW', age: 20, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250186227.jpg' },
  { number: 17, name: 'Jesus Rodríguez', position: 'FW', age: 20, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197195.jpg' },
  { number: 90, name: 'Moise Kean', position: 'FW', age: 26, club: 'Como 1907', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250087919.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 13, 5, 6, 7, 9, 11, 17],
};
