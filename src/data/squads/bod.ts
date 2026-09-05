import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Julian Faye Lund', position: 'GK', age: 27, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250085663.jpg' },
  { number: 12, name: 'Nikita Haikin', position: 'GK', age: 31, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250141864.jpg' },
  { number: 43, name: 'Martin Lund Andersen', position: 'GK', age: 17, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212817.jpg' },
  { number: 45, name: 'Isak Sjong', position: 'GK', age: 19, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250182524.jpg' },
  // Defensores
  { number: 2, name: 'Villads Nielsen', position: 'DF', age: 21, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189213.jpg' },
  { number: 4, name: 'Odin Bjørtuft', position: 'DF', age: 27, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187215.jpg' },
  { number: 5, name: 'Haitam Aleesami', position: 'DF', age: 35, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250084903.jpg' },
  { number: 6, name: 'Jostein Gundersen', position: 'DF', age: 30, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250109274.jpg' },
  { number: 15, name: 'Fredrik Bjørkan', position: 'DF', age: 28, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250104207.jpg' },
  { number: 35, name: 'Matias Jaiteh', position: 'DF', age: 18, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213119.jpg' },
  { number: 36, name: 'Mathias Blix Olsen', position: 'DF', age: 19, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213088.jpg' },
  // Centrocampistas
  { number: 7, name: 'Patrick Berg', position: 'MF', age: 28, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065292.jpg' },
  { number: 8, name: 'Sondre Auklend', position: 'MF', age: 23, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129159.jpg' },
  { number: 14, name: 'Ulrik Saltnes', position: 'MF', age: 33, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250141867.jpg' },
  { number: 16, name: 'Joshua Kitolano', position: 'MF', age: 25, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250109026.jpg' },
  { number: 19, name: 'Sondre Brunstad Fet', position: 'MF', age: 29, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250141862.jpg' },
  { number: 20, name: 'Fredrik Sjøvold', position: 'MF', age: 23, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250173424.jpg' },
  { number: 23, name: 'Magnus Riisnæs', position: 'MF', age: 21, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138997.jpg' },
  { number: 26, name: 'Håkon Evjen', position: 'MF', age: 26, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250107249.jpg' },
  { number: 28, name: 'Assan Sanyang', position: 'MF', age: 18, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225019.jpg' },
  { number: 32, name: 'Kasper Solhaug', position: 'MF', age: 19, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213132.jpg' },
  { number: 33, name: 'Levi Monsen Yeboah', position: 'MF', age: 16, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213128.jpg' },
  { number: 34, name: 'Erling Eliassen', position: 'MF', age: 17, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213099.jpg' },
  { number: 37, name: 'Jesper Rabben Nygård', position: 'MF', age: 17, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213129.jpg' },
  { number: 94, name: 'August Mikkelsen', position: 'MF', age: 25, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250186245.jpg' },
  // Delanteros
  { number: 9, name: 'Andreas Helmersen', position: 'FW', age: 28, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250078507.jpg' },
  { number: 10, name: 'Jens Petter Hauge', position: 'FW', age: 26, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250104487.jpg' },
  { number: 11, name: 'Ole Didrik Blomberg', position: 'FW', age: 26, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187645.jpg' },
  { number: 17, name: 'Ola Brynhildsen', position: 'FW', age: 27, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117917.jpg' },
  { number: 22, name: 'Joel Mvuka', position: 'FW', age: 23, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250160883.jpg' },
  { number: 25, name: 'Isak Määttä', position: 'FW', age: 25, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138384.jpg' },
  { number: 31, name: 'Hindrin Chooly', position: 'FW', age: 18, club: 'FK Bodø/Glimt', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213093.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 6, 7, 8, 14, 9, 10, 11],
};
