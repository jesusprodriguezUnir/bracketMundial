import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Nick Olij', position: 'GK', age: 31, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250046909.jpg' },
  { number: 32, name: 'Matěj Kovář', position: 'GK', age: 26, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117491.jpg' },
  // Defensores
  { number: 2, name: 'Lutsharel Geertruida', position: 'DF', age: 26, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250104075.jpg' },
  { number: 3, name: 'Yarek Gasiorowski', position: 'DF', age: 21, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171006.jpg' },
  { number: 4, name: 'Armando Obispo', position: 'DF', age: 27, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088117.jpg' },
  { number: 6, name: 'Ryan Flamingo', position: 'DF', age: 23, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189506.jpg' },
  { number: 8, name: 'Sergiño Dest', position: 'DF', age: 25, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112998.jpg' },
  { number: 17, name: 'Mauro Júnior', position: 'DF', age: 27, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250122213.jpg' },
  { number: 18, name: 'Filip Kostić', position: 'DF', age: 33, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250024301.jpg' },
  { number: 25, name: 'Kiliann Sildillia', position: 'DF', age: 24, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177927.jpg' },
  // Centrocampistas
  { number: 10, name: 'Paul Wanner', position: 'MF', age: 20, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163784.jpg' },
  { number: 20, name: 'Guus Til', position: 'MF', age: 28, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250099671.jpg' },
  { number: 21, name: 'Sven Mijnans', position: 'MF', age: 26, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250172703.jpg' },
  { number: 24, name: 'Kodai Sano', position: 'MF', age: 22, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218556.jpg' },
  { number: 35, name: 'Ayoni Santos', position: 'MF', age: 21, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218836.jpg' },
  // Delanteros
  { number: 5, name: 'Ivan Perišić', position: 'FW', age: 37, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/103310.jpg' },
  { number: 7, name: 'Ruben van Bommel', position: 'FW', age: 22, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187458.jpg' },
  { number: 9, name: 'Ricardo Pepi', position: 'FW', age: 23, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187620.jpg' },
  { number: 11, name: 'Sami Ouaissa', position: 'FW', age: 21, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216420.jpg' },
  { number: 14, name: 'Alassane Pléa', position: 'FW', age: 33, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250026751.jpg' },
  { number: 19, name: 'Esmir Bajraktarević', position: 'FW', age: 21, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200525.jpg' },
  { number: 27, name: 'Dennis Man', position: 'FW', age: 28, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250104534.jpg' },
  { number: 29, name: 'Sam Lammers', position: 'FW', age: 29, club: 'PSV Eindhoven', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088106.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 6, 10, 20, 21, 5, 7, 9],
};
