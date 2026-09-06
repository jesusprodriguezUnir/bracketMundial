import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Zion Suzuki', position: 'GK', age: 24, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218560.jpg' },
  { number: 40, name: 'Marco Bizot', position: 'GK', age: 35, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250006714.jpg' },
  { number: 42, name: 'James Wright', position: 'GK', age: 21, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188465.jpg' },
  // Defensores
  { number: 2, name: 'Matty Cash', position: 'DF', age: 29, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169376.jpg' },
  { number: 3, name: 'Victor Lindelöf', position: 'DF', age: 32, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250055905.jpg' },
  { number: 5, name: 'Tyrone Mings', position: 'DF', age: 33, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250133856.jpg' },
  { number: 13, name: 'Matteo Ruggeri', position: 'DF', age: 24, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127239.jpg' },
  { number: 14, name: 'Pau Torres', position: 'DF', age: 29, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088461.jpg' },
  { number: 22, name: 'Ian Maatsen', position: 'DF', age: 24, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117581.jpg' },
  { number: 26, name: 'Lamare Bogarde', position: 'DF', age: 22, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139057.jpg' },
  { number: 29, name: 'Aaron Wan-Bissaka', position: 'DF', age: 28, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123067.jpg' },
  // Centrocampistas
  { number: 6, name: 'Ross Barkley', position: 'MF', age: 32, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250007655.jpg' },
  { number: 7, name: 'John McGinn', position: 'MF', age: 31, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058958.jpg' },
  { number: 8, name: 'Boubacar Kamara', position: 'MF', age: 26, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250091722.jpg' },
  { number: 27, name: 'Leon Goretzka', position: 'MF', age: 31, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250041771.jpg' },
  { number: 35, name: 'João Gomes', position: 'MF', age: 25, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194571.jpg' },
  { number: 44, name: 'Johan Manzambi', position: 'MF', age: 20, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192993.jpg' },
  // Delanteros
  { number: 10, name: 'Emiliano Buendía', position: 'FW', age: 29, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250080569.jpg' },
  { number: 11, name: 'Nicolas Jackson', position: 'FW', age: 25, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163689.jpg' },
  { number: 17, name: 'Alejandro Garnacho', position: 'FW', age: 22, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135496.jpg' },
  { number: 18, name: 'Tammy Abraham', position: 'FW', age: 28, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250067629.jpg' },
  { number: 19, name: 'Ibrahim Mbaye', position: 'FW', age: 18, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190117.jpg' },
  { number: 47, name: 'Alysson', position: 'FW', age: 20, club: 'Aston Villa FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221088.jpg' },
];

export const lineup: Lineup = {
  formation: '4-2-4',
  startingXI: [1, 22, 5, 3, 2, 8, 6, 10, 11, 7, 13],
};
