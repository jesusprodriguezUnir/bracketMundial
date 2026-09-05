import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 29, name: 'Nazar Domchak', position: 'GK', age: 19, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250215254.jpg' },
  { number: 35, name: 'Jakub Markovič', position: 'GK', age: 25, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250115748.jpg' },
  // Defensores
  { number: 2, name: 'Štěpán Chaloupek', position: 'DF', age: 23, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250190353.jpg' },
  { number: 3, name: 'Tomáš Holeš', position: 'DF', age: 33, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250054481.jpg' },
  { number: 4, name: 'David Zima', position: 'DF', age: 25, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124916.jpg' },
  { number: 6, name: 'Ange N\'Guessan', position: 'DF', age: 23, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223131.jpg' },
  { number: 27, name: 'Tomáš Vlček', position: 'DF', age: 25, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250115749.jpg' },
  { number: 42, name: 'Mikuláš Konečný', position: 'DF', age: 20, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250170001.jpg' },
  // Centrocampistas
  { number: 8, name: 'Oskar Kubiak', position: 'MF', age: 19, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223130.jpg' },
  { number: 10, name: 'Danijel Šturm', position: 'MF', age: 27, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250158167.jpg' },
  { number: 14, name: 'Samuel Isife', position: 'MF', age: 22, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221826.jpg' },
  { number: 15, name: 'Mubarak Suleiman', position: 'MF', age: 19, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250211977.jpg' },
  { number: 16, name: 'David Moses', position: 'MF', age: 22, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210225.jpg' },
  { number: 17, name: 'Lukáš Provod', position: 'MF', age: 29, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064811.jpg' },
  { number: 20, name: 'Emmanuel Ayaosi', position: 'MF', age: 21, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223128.jpg' },
  { number: 22, name: 'Toumani Diakite', position: 'MF', age: 20, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209358.jpg' },
  { number: 23, name: 'Michal Sadílek', position: 'MF', age: 27, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250077931.jpg' },
  { number: 26, name: 'Ivan Schranz', position: 'MF', age: 32, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250012660.jpg' },
  { number: 30, name: 'Wiktor Nowak', position: 'MF', age: 21, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212505.jpg' },
  { number: 32, name: 'Pavel Kačor', position: 'MF', age: 19, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218489.jpg' },
  { number: 39, name: 'David Jurásek', position: 'MF', age: 26, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250166772.jpg' },
  { number: 43, name: 'Eliáš Piták', position: 'MF', age: 20, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250170005.jpg' },
  // Delanteros
  { number: 13, name: 'Mojmír Chytil', position: 'FW', age: 27, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250092161.jpg' },
  { number: 18, name: 'Adonija Ouanda', position: 'FW', age: 21, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223132.jpg' },
  { number: 25, name: 'Tomáš Chorý', position: 'FW', age: 31, club: 'SK Slavia Praha', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042406.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [29, 2, 3, 4, 6, 8, 10, 14, 13, 18, 25],
};
