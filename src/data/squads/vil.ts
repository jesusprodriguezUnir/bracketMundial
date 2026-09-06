import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Luiz Júnior', position: 'GK', age: 25, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210287.jpg' },
  { number: 13, name: 'Rubén Gómez', position: 'GK', age: 24, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193930.jpg' },
  { number: 25, name: 'Péter Gulácsi', position: 'GK', age: 36, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/102420.jpg' },
  { number: 35, name: 'Yakiv Kinareikin', position: 'GK', age: 22, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250175645.jpg' },
  // Defensores
  { number: 2, name: 'Logan Costa', position: 'DF', age: 25, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106707.jpg' },
  { number: 3, name: 'Alex Freeman', position: 'DF', age: 22, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209023.jpg' },
  { number: 6, name: 'Pau Navarro', position: 'DF', age: 21, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210288.jpg' },
  { number: 8, name: 'Juan Foyth', position: 'DF', age: 28, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250147278.jpg' },
  { number: 12, name: 'Renato Veiga', position: 'DF', age: 23, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164935.jpg' },
  { number: 15, name: 'Santiago Mouriño', position: 'DF', age: 24, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188006.jpg' },
  { number: 20, name: 'Carlos Romero', position: 'DF', age: 24, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177929.jpg' },
  { number: 23, name: 'Sergi Cardona', position: 'DF', age: 27, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210289.jpg' },
  // Centrocampistas
  { number: 10, name: 'Alberto Moleiro', position: 'MF', age: 22, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250168991.jpg' },
  { number: 14, name: 'Santi Comesaña', position: 'MF', age: 29, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188937.jpg' },
  { number: 16, name: 'Carlos Macia', position: 'MF', age: 18, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212013.jpg' },
  { number: 18, name: 'Pape Gueye', position: 'MF', age: 27, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144229.jpg' },
  { number: 21, name: 'Tani Oluwaseyi', position: 'MF', age: 26, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250195532.jpg' },
  { number: 24, name: 'Nathan Saliba', position: 'MF', age: 22, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209018.jpg' },
  { number: 27, name: 'Nizar El Jmili', position: 'MF', age: 21, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224969.jpg' },
  // Delanteros
  { number: 7, name: 'Gerard Moreno', position: 'FW', age: 34, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250074565.jpg' },
  { number: 9, name: 'Georges Mikautadze', position: 'FW', age: 25, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250155025.jpg' },
  { number: 11, name: 'Ilias Akhomach', position: 'FW', age: 22, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139241.jpg' },
  { number: 17, name: 'Tajon Buchanan', position: 'FW', age: 27, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250173127.jpg' },
  { number: 19, name: 'Nicolas Pépé', position: 'FW', age: 31, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106003.jpg' },
  { number: 22, name: 'Ayoze Pérez', position: 'FW', age: 33, club: 'Villarreal CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250075625.jpg' },
];

export const lineup: Lineup = {
  formation: '4-2-4',
  startingXI: [1, 20, 12, 2, 15, 14, 18, 17, 24, 9, 19],
};
