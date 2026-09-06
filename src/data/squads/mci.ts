import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Gianluigi Donnarumma', position: 'GK', age: 27, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250078922.jpg' },
  { number: 13, name: 'Marcus Bettinelli', position: 'GK', age: 34, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250011491.jpg' },
  { number: 28, name: 'Gerónimo Rulli', position: 'GK', age: 34, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250073918.jpg' },
  { number: 94, name: 'Max-Edgar Chabot', position: 'GK', age: 18, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225269.jpg' },
  // Defensores
  { number: 3, name: 'Rúben Dias', position: 'DF', age: 29, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250058220.jpg' },
  { number: 6, name: 'Marc Guéhi', position: 'DF', age: 26, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250086928.jpg' },
  { number: 21, name: 'Rayan Aït-Nouri', position: 'DF', age: 25, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127436.jpg' },
  { number: 22, name: 'Vitor Reis', position: 'DF', age: 20, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250205653.jpg' },
  { number: 24, name: 'Joško Gvardiol', position: 'DF', age: 24, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127284.jpg' },
  { number: 45, name: 'Abdukodir Khusanov', position: 'DF', age: 22, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187698.jpg' },
  { number: 82, name: 'Rico Lewis', position: 'DF', age: 21, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139207.jpg' },
  // Centrocampistas
  { number: 5, name: 'Elliot Anderson', position: 'MF', age: 23, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117617.jpg' },
  { number: 8, name: 'Mateo Kovačić', position: 'MF', age: 32, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250023551.jpg' },
  { number: 10, name: 'Rayan Cherki', position: 'MF', age: 23, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124063.jpg' },
  { number: 11, name: 'Jeremy Doku', position: 'MF', age: 24, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113142.jpg' },
  { number: 17, name: 'Enzo Fernández', position: 'MF', age: 25, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174838.jpg' },
  { number: 27, name: 'Matheus Nunes', position: 'MF', age: 28, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250145803.jpg' },
  { number: 32, name: 'Ayyoub Bouaddi', position: 'MF', age: 18, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250191448.jpg' },
  { number: 47, name: 'Phil Foden', position: 'MF', age: 26, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101534.jpg' },
  // Delanteros
  { number: 7, name: 'Iliman Ndiaye', position: 'FW', age: 26, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181626.jpg' },
  { number: 9, name: 'Erling Haaland', position: 'FW', age: 26, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250103758.jpg' },
  { number: 37, name: 'Allan Elias', position: 'FW', age: 22, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225023.jpg' },
  { number: 42, name: 'Antoine Semenyo', position: 'FW', age: 26, club: 'Manchester City FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181717.jpg' },
];

export const lineup: Lineup = {
  formation: '4-2-4',
  startingXI: [1, 6, 24, 3, 45, 17, 5, 47, 10, 9, 42],
};
