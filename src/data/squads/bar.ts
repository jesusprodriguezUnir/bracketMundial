import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Joan García', position: 'GK', age: 25, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118131.jpg' },
  { number: 13, name: 'Wojciech Szczęsny', position: 'GK', age: 36, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/108501.jpg' },
  { number: 25, name: 'Dominik Livaković', position: 'GK', age: 31, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042625.jpg' },
  // Defensores
  { number: 2, name: 'João Cancelo', position: 'DF', age: 32, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250024746.jpg' },
  { number: 3, name: 'Alejandro Balde', position: 'DF', age: 22, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135416.jpg' },
  { number: 5, name: 'Pau Cubarsí', position: 'DF', age: 19, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176453.jpg' },
  { number: 12, name: 'Xavi Espart', position: 'DF', age: 19, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190377.jpg' },
  { number: 15, name: 'Andreas Christensen', position: 'DF', age: 30, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250041718.jpg' },
  { number: 18, name: 'Gerard Martín', position: 'DF', age: 24, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197801.jpg' },
  { number: 23, name: 'Jules Koundé', position: 'DF', age: 27, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250096309.jpg' },
  { number: 24, name: 'Eric García', position: 'DF', age: 25, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250103561.jpg' },
  // Centrocampistas
  { number: 6, name: 'Gavi', position: 'MF', age: 22, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139255.jpg' },
  { number: 8, name: 'Pedri', position: 'MF', age: 23, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250143693.jpg' },
  { number: 16, name: 'Rodri', position: 'MF', age: 30, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250082664.jpg' },
  { number: 21, name: 'Frenkie de Jong', position: 'MF', age: 29, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/50327423.jpg' },
  { number: 22, name: 'Marc Bernal', position: 'MF', age: 19, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190383.jpg' },
  // Delanteros
  { number: 7, name: 'Fermín López', position: 'FW', age: 23, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164780.jpg' },
  { number: 9, name: 'Gabriel Jesus', position: 'FW', age: 29, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106649.jpg' },
  { number: 10, name: 'Lamine Yamal', position: 'FW', age: 19, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176450.jpg' },
  { number: 11, name: 'Raphinha', position: 'FW', age: 29, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112880.jpg' },
  { number: 14, name: 'Karim Adeyemi', position: 'FW', age: 24, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127347.jpg' },
  { number: 17, name: 'Anthony Gordon', position: 'FW', age: 25, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117036.jpg' },
  { number: 20, name: 'Dani Olmo', position: 'FW', age: 28, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250081720.jpg' },
  { number: 27, name: 'Jesse Bisiwu', position: 'FW', age: 18, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194007.jpg' },
  { number: 29, name: 'Hamza Abdelkarim', position: 'FW', age: 18, club: 'FC Barcelona', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221011.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 5, 12, 6, 8, 16, 7, 9, 10],
};
