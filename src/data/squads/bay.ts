import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Manuel Neuer', position: 'GK', age: 40, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/97923.jpg' },
  { number: 26, name: 'Sven Ulreich', position: 'GK', age: 38, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/1902445.jpg' },
  { number: 40, name: 'Jonas Urbig', position: 'GK', age: 23, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153936.jpg' },
  // Defensores
  { number: 2, name: 'Dayot Upamecano', position: 'DF', age: 27, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250079545.jpg' },
  { number: 3, name: 'Minjae Kim', position: 'DF', age: 29, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250162325.jpg' },
  { number: 4, name: 'Jonathan Tah', position: 'DF', age: 30, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250055660.jpg' },
  { number: 11, name: 'Nathaniel Brown', position: 'DF', age: 23, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190350.jpg' },
  { number: 21, name: 'Hiroki Ito', position: 'DF', age: 27, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181455.jpg' },
  { number: 23, name: 'Sacha Boey', position: 'DF', age: 25, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250136348.jpg' },
  { number: 44, name: 'Josip Stanišić', position: 'DF', age: 26, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112220.jpg' },
  // Centrocampistas
  { number: 6, name: 'Joshua Kimmich', position: 'MF', age: 31, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250070417.jpg' },
  { number: 8, name: 'Tom Bischof', position: 'MF', age: 21, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250168211.jpg' },
  { number: 10, name: 'Jamal Musiala', position: 'MF', age: 23, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124430.jpg' },
  { number: 17, name: 'Michael Olise', position: 'MF', age: 24, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171184.jpg' },
  { number: 19, name: 'Alphonso Davies', position: 'MF', age: 25, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128120.jpg' },
  { number: 27, name: 'Konrad Laimer', position: 'MF', age: 29, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065413.jpg' },
  { number: 34, name: 'Ismael Saibari', position: 'MF', age: 25, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134320.jpg' },
  { number: 39, name: 'Bara Sapoko Ndiaye', position: 'MF', age: 18, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221022.jpg' },
  { number: 45, name: 'Aleksandar Pavlović', position: 'MF', age: 22, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163777.jpg' },
  // Delanteros
  { number: 7, name: 'Serge Gnabry', position: 'FW', age: 31, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250041770.jpg' },
  { number: 9, name: 'Harry Kane', position: 'FW', age: 33, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250016833.jpg' },
  { number: 14, name: 'Luis Díaz', position: 'FW', age: 29, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132811.jpg' },
  { number: 33, name: 'Bastian Assomo', position: 'FW', age: 16, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224184.jpg' },
  { number: 49, name: 'Maycon Cardozo', position: 'FW', age: 17, club: 'FC Bayern München', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212724.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 11, 6, 8, 10, 7, 9, 14],
};
