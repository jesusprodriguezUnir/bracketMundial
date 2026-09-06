import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Fabian Bredlow', position: 'GK', age: 31, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250070418.jpg' },
  { number: 33, name: 'Marius Funk', position: 'GK', age: 30, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058261.jpg' },
  { number: 41, name: 'Dennis Seimen', position: 'GK', age: 20, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250170952.jpg' },
  { number: 56, name: 'Tom Walz', position: 'GK', age: 17, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218212.jpg' },
  { number: 57, name: 'Lucas Nagel', position: 'GK', age: 17, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224503.jpg' },
  // Defensores
  { number: 2, name: 'Ameen Al-Dakhil', position: 'DF', age: 24, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127149.jpg' },
  { number: 3, name: 'Ramon Hendriks', position: 'DF', age: 25, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106750.jpg' },
  { number: 4, name: 'Josha Vagnoman', position: 'DF', age: 25, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127538.jpg' },
  { number: 7, name: 'Maximilian Mittelstädt', position: 'DF', age: 29, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250090766.jpg' },
  { number: 14, name: 'Luca Jaquez', position: 'DF', age: 23, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250186841.jpg' },
  { number: 22, name: 'Lorenz Assignon', position: 'DF', age: 26, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250136347.jpg' },
  { number: 24, name: 'Jeff Chabot', position: 'DF', age: 28, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250107477.jpg' },
  { number: 37, name: 'Maximilian Herwerth', position: 'DF', age: 20, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199540.jpg' },
  { number: 47, name: 'Yanik Spalt', position: 'DF', age: 19, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250184508.jpg' },
  { number: 58, name: 'Alexander Groiß', position: 'DF', age: 28, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212172.jpg' },
  { number: 59, name: 'Dominik Nothnagel', position: 'DF', age: 31, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212173.jpg' },
  // Centrocampistas
  { number: 6, name: 'Angelo Stiller', position: 'MF', age: 25, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112217.jpg' },
  { number: 9, name: 'Ermedin Demirović', position: 'MF', age: 28, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250079383.jpg' },
  { number: 10, name: 'Chris Führich', position: 'MF', age: 28, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192048.jpg' },
  { number: 11, name: 'Bilal El Khannouss', position: 'MF', age: 22, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154129.jpg' },
  { number: 16, name: 'Atakan Karazor', position: 'MF', age: 29, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250196709.jpg' },
  { number: 21, name: 'Grischa Prömel', position: 'MF', age: 31, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101240.jpg' },
  { number: 28, name: 'Nikolas Nartey', position: 'MF', age: 26, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101564.jpg' },
  { number: 29, name: 'Finn Jeltsch', position: 'MF', age: 20, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250170132.jpg' },
  { number: 39, name: 'Ertugrul Yigit', position: 'MF', age: 17, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201762.jpg' },
  { number: 44, name: 'Leo Sauer', position: 'MF', age: 20, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164450.jpg' },
  { number: 49, name: 'Lauri Penna', position: 'MF', age: 20, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201752.jpg' },
  // Delanteros
  { number: 8, name: 'Tiago Tomás', position: 'FW', age: 24, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250126369.jpg' },
  { number: 17, name: 'Dzenan Pejcinovic', position: 'FW', age: 21, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250168144.jpg' },
  { number: 18, name: 'Jamie Leweling', position: 'FW', age: 25, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138382.jpg' },
  { number: 26, name: 'Deniz Undav', position: 'FW', age: 30, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194673.jpg' },
  { number: 43, name: 'Jarzinho Malanga', position: 'FW', age: 20, club: 'VfB Stuttgart', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250180810.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 24, 7, 29, 4, 21, 6, 11, 2, 3, 9],
};
