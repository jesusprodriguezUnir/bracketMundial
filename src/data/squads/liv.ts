import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alisson Becker', position: 'GK', age: 33, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250099867.jpg' },
  { number: 25, name: 'Giorgi Mamardashvili', position: 'GK', age: 25, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101805.jpg' },
  { number: 28, name: 'Freddie Woodman', position: 'GK', age: 29, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250056572.jpg' },
  { number: 56, name: 'Vitězslav Jaroš', position: 'GK', age: 25, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113263.jpg' },
  // Defensores
  { number: 2, name: 'Joe Gomez', position: 'DF', age: 29, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058215.jpg' },
  { number: 4, name: 'Virgil van Dijk', position: 'DF', age: 35, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/50327420.jpg' },
  { number: 5, name: 'Jérémy Jacquet', position: 'DF', age: 21, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177928.jpg' },
  { number: 6, name: 'Milos Kerkez', position: 'DF', age: 22, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163153.jpg' },
  { number: 12, name: 'Conor Bradley', position: 'DF', age: 23, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135607.jpg' },
  { number: 15, name: 'Giovanni Leoni', position: 'DF', age: 19, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250203207.jpg' },
  { number: 21, name: 'Kostas Tsimikas', position: 'DF', age: 30, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076631.jpg' },
  { number: 30, name: 'Jeremie Frimpong', position: 'DF', age: 25, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113276.jpg' },
  { number: 33, name: 'Ronald Araújo', position: 'DF', age: 27, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134170.jpg' },
  { number: 44, name: 'Luke Chambers', position: 'DF', age: 22, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154417.jpg' },
  { number: 52, name: 'Isaac Mabaya', position: 'DF', age: 21, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154425.jpg' },
  // Centrocampistas
  { number: 7, name: 'Florian Wirtz', position: 'MF', age: 23, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139445.jpg' },
  { number: 8, name: 'Dominik Szoboszlai', position: 'MF', age: 25, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250104066.jpg' },
  { number: 10, name: 'Alexis Mac Allister', position: 'MF', age: 27, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250172672.jpg' },
  { number: 23, name: 'Víctor Muñoz', position: 'MF', age: 23, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164215.jpg' },
  { number: 38, name: 'Ryan Gravenberch', position: 'MF', age: 24, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113001.jpg' },
  { number: 53, name: 'James McConnell', position: 'MF', age: 21, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154426.jpg' },
  // Delanteros
  { number: 9, name: 'Alexander Isak', position: 'FW', age: 26, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250089868.jpg' },
  { number: 18, name: 'Cody Gakpo', position: 'FW', age: 27, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250096849.jpg' },
  { number: 22, name: 'Hugo Ekitiké', position: 'FW', age: 24, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144643.jpg' },
  { number: 29, name: 'Bradley Barcola', position: 'FW', age: 24, club: 'Liverpool FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134138.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 6, 7, 8, 10, 9, 18, 22],
};
