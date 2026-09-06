import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Berke Özer', position: 'GK', age: 26, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250102646.jpg' },
  { number: 12, name: 'Orlando Gill', position: 'GK', age: 26, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218467.jpg' },
  // Defensores
  { number: 2, name: 'Loun Srdanovic', position: 'DF', age: 20, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250179746.jpg' },
  { number: 3, name: 'Nathan Ngoy', position: 'DF', age: 23, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130418.jpg' },
  { number: 4, name: 'Alexsandro', position: 'DF', age: 27, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188247.jpg' },
  { number: 15, name: 'Romain Perraud', position: 'DF', age: 28, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250068803.jpg' },
  { number: 22, name: 'Tiago Santos', position: 'DF', age: 24, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188246.jpg' },
  { number: 23, name: 'Tanguy Nianzou', position: 'DF', age: 24, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118959.jpg' },
  { number: 24, name: 'Calvin Verdonk', position: 'DF', age: 29, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250066559.jpg' },
  { number: 26, name: 'Isaac Cossier', position: 'DF', age: 19, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201718.jpg' },
  { number: 38, name: 'Maxima Goffi', position: 'DF', age: 18, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201725.jpg' },
  // Centrocampistas
  { number: 6, name: 'Nabil Bentaleb', position: 'MF', age: 31, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250057690.jpg' },
  { number: 8, name: 'Ethan Mbappé', position: 'MF', age: 19, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189110.jpg' },
  { number: 10, name: 'Hákon Arnar Haraldsson', position: 'MF', age: 23, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128943.jpg' },
  { number: 11, name: 'Osame Sahraoui', position: 'MF', age: 25, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250146610.jpg' },
  { number: 14, name: 'Maurits Kjærgaard', position: 'MF', age: 23, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129343.jpg' },
  { number: 17, name: 'Ngal\'Ayel Mukau', position: 'MF', age: 21, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250198114.jpg' },
  { number: 19, name: 'Başar Önal', position: 'MF', age: 22, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250178658.jpg' },
  { number: 21, name: 'Benjamin André', position: 'MF', age: 36, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250025791.jpg' },
  // Delanteros
  { number: 7, name: 'Dilane Bakwa', position: 'FW', age: 24, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112700.jpg' },
  { number: 9, name: 'Olivier Giroud', position: 'FW', age: 39, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250020851.jpg' },
  { number: 18, name: 'Ayase Ueda', position: 'FW', age: 28, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181460.jpg' },
  { number: 28, name: 'Gaëtan Perrin', position: 'FW', age: 30, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250062684.jpg' },
  { number: 35, name: 'Soriba Diaoune', position: 'FW', age: 19, club: 'Lille OSC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201719.jpg' },
];

export const lineup: Lineup = {
  formation: '4-2-4',
  startingXI: [1, 24, 3, 4, 22, 6, 21, 11, 10, 9, 8],
};
