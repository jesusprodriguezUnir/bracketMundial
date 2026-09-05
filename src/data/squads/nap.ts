import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alex Meret', position: 'GK', age: 29, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250066753.jpg' },
  { number: 14, name: 'Nikita Contini', position: 'GK', age: 30, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064393.jpg' },
  { number: 32, name: 'Vanja Milinković-Savić', position: 'GK', age: 29, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065792.jpg' },
  // Defensores
  { number: 2, name: 'Costantino Favasuli', position: 'DF', age: 22, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250175777.jpg' },
  { number: 5, name: 'Benoît Badiashile', position: 'DF', age: 25, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113290.jpg' },
  { number: 13, name: 'Amir Rrahmani', position: 'DF', age: 32, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250059233.jpg' },
  { number: 16, name: 'Rafa Marín', position: 'DF', age: 24, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129412.jpg' },
  { number: 17, name: 'Mathías Olivera', position: 'DF', age: 28, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134196.jpg' },
  { number: 22, name: 'Giovanni Di Lorenzo', position: 'DF', age: 33, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064229.jpg' },
  { number: 31, name: 'Sam Beukema', position: 'DF', age: 27, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250161248.jpg' },
  { number: 37, name: 'Leonardo Spinazzola', position: 'DF', age: 33, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250020885.jpg' },
  // Centrocampistas
  { number: 6, name: 'Billy Gilmour', position: 'MF', age: 25, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250107117.jpg' },
  { number: 8, name: 'Scott McTominay', position: 'MF', age: 29, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088240.jpg' },
  { number: 11, name: 'Kevin De Bruyne', position: 'MF', age: 35, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250008901.jpg' },
  { number: 68, name: 'Stanislav Lobotka', position: 'MF', age: 31, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250055982.jpg' },
  { number: 99, name: 'Frank Anguissa', position: 'MF', age: 30, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250086987.jpg' },
  // Delanteros
  { number: 7, name: 'David Neres', position: 'FW', age: 29, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106648.jpg' },
  { number: 19, name: 'Rasmus Højlund', position: 'FW', age: 23, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130221.jpg' },
  { number: 20, name: 'Lorenzo Lucca', position: 'FW', age: 25, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164476.jpg' },
  { number: 21, name: 'Matteo Politano', position: 'FW', age: 33, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250050381.jpg' },
  { number: 26, name: 'Antonio Vergara', position: 'FW', age: 23, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250165363.jpg' },
  { number: 27, name: 'Alisson Santos', position: 'FW', age: 23, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250211008.jpg' },
  { number: 70, name: 'Noa Lang', position: 'FW', age: 27, club: 'SSC Napoli', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250091165.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 13, 16, 6, 8, 11, 7, 19, 20],
};
