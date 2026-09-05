import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 95, name: 'Pierluigi Gollini', position: 'GK', age: 31, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058930.jpg' },
  { number: 99, name: 'Mile Svilar', position: 'GK', age: 27, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076007.jpg' },
  // Defensores
  { number: 2, name: 'Devyne Rensch', position: 'DF', age: 23, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123555.jpg' },
  { number: 3, name: 'Konstantinos Koulierakis', position: 'DF', age: 22, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129645.jpg' },
  { number: 5, name: 'Evan N\'Dicka', position: 'DF', age: 27, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250122785.jpg' },
  { number: 20, name: 'Nahuel Molina', position: 'DF', age: 28, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250172673.jpg' },
  { number: 22, name: 'Mario Hermoso', position: 'DF', age: 31, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250063940.jpg' },
  { number: 23, name: 'Gianluca Mancini', position: 'DF', age: 30, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250075982.jpg' },
  { number: 26, name: 'Leonardo Balerdi', position: 'DF', age: 27, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128118.jpg' },
  { number: 43, name: 'Wesley França', position: 'DF', age: 22, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212323.jpg' },
  { number: 77, name: 'Emanuele Lulli', position: 'DF', age: 19, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216846.jpg' },
  { number: 87, name: 'Daniele Ghilardi', position: 'DF', age: 23, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250166174.jpg' },
  // Centrocampistas
  { number: 4, name: 'Bryan Cristante', position: 'MF', age: 31, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250041741.jpg' },
  { number: 7, name: 'Lorenzo Pellegrini', position: 'MF', age: 30, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250070130.jpg' },
  { number: 15, name: 'Marten de Roon', position: 'MF', age: 35, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250014709.jpg' },
  { number: 17, name: 'Manu Koné', position: 'MF', age: 25, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132062.jpg' },
  { number: 61, name: 'Niccolò Pisilli', position: 'MF', age: 21, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183335.jpg' },
  // Delanteros
  { number: 9, name: 'Santiago Castro', position: 'FW', age: 21, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250196543.jpg' },
  { number: 14, name: 'Donyell Malen', position: 'FW', age: 27, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250081555.jpg' },
  { number: 18, name: 'Matias Soulé', position: 'FW', age: 23, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250140929.jpg' },
  { number: 21, name: 'Paulo Dybala', position: 'FW', age: 32, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250086333.jpg' },
  { number: 68, name: 'Antonio Arena', position: 'FW', age: 17, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250206586.jpg' },
  { number: 86, name: 'Rodrigo Mora', position: 'FW', age: 19, club: 'AS Roma', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177837.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [95, 2, 3, 5, 20, 4, 7, 15, 9, 14, 18],
};
