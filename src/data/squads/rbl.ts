import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Ørjan Nyland', position: 'GK', age: 35, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/108923.jpg' },
  { number: 26, name: 'Maarten Vandevoordt', position: 'GK', age: 24, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118787.jpg' },
  // Defensores
  { number: 4, name: 'Willi Orbán', position: 'DF', age: 33, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250051754.jpg' },
  { number: 16, name: 'Lukas Klostermann', position: 'DF', age: 30, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058260.jpg' },
  { number: 22, name: 'David Raum', position: 'DF', age: 28, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250110361.jpg' },
  { number: 23, name: 'Castello Lukeba', position: 'DF', age: 23, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124068.jpg' },
  { number: 35, name: 'Max Finkgräfe', position: 'DF', age: 22, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250162917.jpg' },
  { number: 39, name: 'Benjamin Henrichs', position: 'DF', age: 29, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058258.jpg' },
  // Centrocampistas
  { number: 3, name: 'Maxime Esteve', position: 'MF', age: 24, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124756.jpg' },
  { number: 6, name: 'Ezechiel Banzuzi', position: 'MF', age: 21, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171161.jpg' },
  { number: 13, name: 'Nicolas Seiwald', position: 'MF', age: 25, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250114167.jpg' },
  { number: 14, name: 'Christoph Baumgartner', position: 'MF', age: 27, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250089289.jpg' },
  { number: 17, name: 'Ridle Baku', position: 'MF', age: 28, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250104720.jpg' },
  { number: 20, name: 'Rocco Reitz', position: 'MF', age: 24, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144303.jpg' },
  { number: 21, name: 'Neil El Aynaoui', position: 'MF', age: 25, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187059.jpg' },
  { number: 28, name: 'Christopher Nkunku', position: 'MF', age: 28, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076654.jpg' },
  { number: 30, name: 'Andrija Maksimović', position: 'MF', age: 19, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177722.jpg' },
  // Delanteros
  { number: 9, name: 'Marc Guiu', position: 'FW', age: 20, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176455.jpg' },
  { number: 10, name: 'Brajan Gruda', position: 'FW', age: 22, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250178786.jpg' },
  { number: 11, name: 'Johan Bakayoko', position: 'FW', age: 23, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130406.jpg' },
  { number: 27, name: 'Tidiam Gomis', position: 'FW', age: 20, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250183342.jpg' },
  { number: 40, name: 'Rômulo Cardoso', position: 'FW', age: 24, club: 'RB Leipzig', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221087.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 4, 16, 22, 23, 3, 6, 13, 9, 10, 11],
};
