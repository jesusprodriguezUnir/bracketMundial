import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Arild Østbø', position: 'GK', age: 35, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/1905505.jpg' },
  { number: 12, name: 'Erlend Jacobsen', position: 'GK', age: 27, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223246.jpg' },
  { number: 30, name: 'Ľubomír Belko', position: 'GK', age: 24, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124826.jpg' },
  // Defensores
  { number: 2, name: 'Herman Haugen', position: 'DF', age: 26, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210010.jpg' },
  { number: 3, name: 'Viljar Vevatne', position: 'DF', age: 31, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250055970.jpg' },
  { number: 4, name: 'Martin Ove Roseth', position: 'DF', age: 28, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250086599.jpg' },
  { number: 5, name: 'Henrik Heggheim', position: 'DF', age: 25, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144866.jpg' },
  { number: 6, name: 'Gianni Stensness', position: 'DF', age: 27, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174059.jpg' },
  { number: 17, name: 'Essiën Bassey', position: 'DF', age: 19, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201827.jpg' },
  { number: 18, name: 'Sondre Bjørshol', position: 'DF', age: 32, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144186.jpg' },
  { number: 21, name: 'Anders Baertelsen', position: 'DF', age: 26, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250103898.jpg' },
  { number: 24, name: 'Vetle Auklend', position: 'DF', age: 21, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250196225.jpg' },
  { number: 25, name: 'Henrik Falchener', position: 'DF', age: 23, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139481.jpg' },
  { number: 27, name: 'Jesper Daland', position: 'DF', age: 26, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250103750.jpg' },
  { number: 28, name: 'Kristoffer Haugen', position: 'DF', age: 32, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250027039.jpg' },
  // Centrocampistas
  { number: 7, name: 'Kristoffer Askildsen', position: 'MF', age: 25, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117864.jpg' },
  { number: 8, name: 'Joe Bell', position: 'MF', age: 27, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138504.jpg' },
  { number: 10, name: 'Zlatko Tripić', position: 'MF', age: 33, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250051338.jpg' },
  { number: 15, name: 'Ola Visted', position: 'MF', age: 21, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223290.jpg' },
  { number: 16, name: 'Henrik Bjørdal', position: 'MF', age: 29, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065289.jpg' },
  { number: 19, name: 'Amin Cosic', position: 'MF', age: 20, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250215287.jpg' },
  { number: 29, name: 'Tobias Moi', position: 'MF', age: 20, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169944.jpg' },
  { number: 33, name: 'Jakob Hansen', position: 'MF', age: 21, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210217.jpg' },
  // Delanteros
  { number: 9, name: 'Nick D\'Agostino', position: 'FW', age: 28, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250210009.jpg' },
  { number: 11, name: 'Romano Postema', position: 'FW', age: 24, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223247.jpg' },
  { number: 14, name: 'Veton Berisha', position: 'FW', age: 32, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250022815.jpg' },
  { number: 20, name: 'Peter Christiansen', position: 'FW', age: 26, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250145630.jpg' },
  { number: 22, name: 'Erik Botheim', position: 'FW', age: 26, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250102068.jpg' },
  { number: 23, name: 'Niklas Fuglestad', position: 'FW', age: 20, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250203364.jpg' },
  { number: 26, name: 'Simen Kvia-Egeskog', position: 'FW', age: 23, club: 'Viking FK', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174185.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 5, 7, 8, 10, 9, 11, 14],
};
