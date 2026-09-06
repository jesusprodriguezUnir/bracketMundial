import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Aleksandar Popović', position: 'GK', age: 26, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250089413.jpg' },
  { number: 32, name: 'Dávid Balog', position: 'GK', age: 19, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250198497.jpg' },
  { number: 44, name: 'Matúš Macík', position: 'GK', age: 33, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250110137.jpg' },
  { number: 71, name: 'Dominik Takáč', position: 'GK', age: 27, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250157134.jpg' },
  // Defensores
  { number: 2, name: 'Samuel Kozlovský', position: 'DF', age: 26, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250089337.jpg' },
  { number: 6, name: 'Kevin Wimmer', position: 'DF', age: 33, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250043066.jpg' },
  { number: 12, name: 'Kenan Bajrić', position: 'DF', age: 31, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250061721.jpg' },
  { number: 15, name: 'Svetozar Marković', position: 'DF', age: 26, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250105502.jpg' },
  { number: 24, name: 'Matúš Tomáško', position: 'DF', age: 16, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250204451.jpg' },
  { number: 26, name: 'Robert Tománek', position: 'DF', age: 20, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222608.jpg' },
  { number: 28, name: 'Cesar Blackman', position: 'DF', age: 28, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250131541.jpg' },
  { number: 49, name: 'Sahmkou Camara', position: 'DF', age: 23, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223129.jpg' },
  { number: 57, name: 'Sandro Cruz', position: 'DF', age: 25, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116653.jpg' },
  // Centrocampistas
  { number: 3, name: 'Peter Pokorný', position: 'MF', age: 25, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250114171.jpg' },
  { number: 5, name: 'Rahim Ibrahim', position: 'MF', age: 25, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210294.jpg' },
  { number: 8, name: 'Artur Gajdoš', position: 'MF', age: 22, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139101.jpg' },
  { number: 11, name: 'Tigran Barseghyan', position: 'MF', age: 32, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250013022.jpg' },
  { number: 20, name: 'Alen Mustafić', position: 'MF', age: 27, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116759.jpg' },
  { number: 25, name: 'Leo Hofstädter', position: 'MF', age: 16, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250208297.jpg' },
  { number: 70, name: 'Cristian Martínez', position: 'MF', age: 29, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221031.jpg' },
  { number: 77, name: 'Danylo Ihnatenko', position: 'MF', age: 29, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250121132.jpg' },
  { number: 88, name: 'Daiki Matsuoka', position: 'MF', age: 25, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250222222.jpg' },
  // Delanteros
  { number: 10, name: 'Nino Marcelli', position: 'FW', age: 21, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183092.jpg' },
  { number: 13, name: 'Roman Čerepkai', position: 'FW', age: 24, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117638.jpg' },
  { number: 14, name: 'Alasana Yirajang', position: 'FW', age: 21, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210296.jpg' },
  { number: 21, name: 'Suleiman Camara', position: 'FW', age: 24, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223119.jpg' },
  { number: 29, name: 'Alexej Maroš', position: 'FW', age: 21, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193070.jpg' },
  { number: 99, name: 'Andraž Šporar', position: 'FW', age: 32, club: 'ŠK Slovan Bratislava', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250050391.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [71, 2, 6, 12, 28, 88, 3, 70, 14, 99, 11],
};
