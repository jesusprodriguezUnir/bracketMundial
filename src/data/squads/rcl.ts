import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Regis Gurtner', position: 'GK', age: 39, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/101529.jpg' },
  { number: 16, name: 'Mathieu Gorgelin', position: 'GK', age: 36, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/107754.jpg' },
  { number: 40, name: 'Robin Risser', position: 'GK', age: 21, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181514.jpg' },
  // Defensores
  { number: 2, name: 'Ruben Aguilar', position: 'DF', age: 33, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250061132.jpg' },
  { number: 4, name: 'Nidal Čelik', position: 'DF', age: 20, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171976.jpg' },
  { number: 6, name: 'Samson Baidoo', position: 'DF', age: 22, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139010.jpg' },
  { number: 14, name: 'Matthieu Udol', position: 'DF', age: 30, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221057.jpg' },
  { number: 20, name: 'Jean-Clair Todibo', position: 'DF', age: 26, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128268.jpg' },
  { number: 22, name: 'Michał Skóraś', position: 'DF', age: 26, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250105686.jpg' },
  { number: 23, name: 'Saud Abdulhamid', position: 'DF', age: 27, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250181167.jpg' },
  { number: 24, name: 'Jonathan Gradit', position: 'DF', age: 33, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250007575.jpg' },
  { number: 25, name: 'Ismaëlo Ganiou', position: 'DF', age: 21, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189553.jpg' },
  { number: 31, name: 'Souleymane Sagnan', position: 'DF', age: 21, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189550.jpg' },
  { number: 32, name: 'Kyllian Antonio', position: 'DF', age: 18, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189812.jpg' },
  // Centrocampistas
  { number: 5, name: 'Andrija Bulatović', position: 'MF', age: 19, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250173262.jpg' },
  { number: 8, name: 'Yacine Titraoui', position: 'MF', age: 23, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209953.jpg' },
  { number: 21, name: 'Amadou Haidara', position: 'MF', age: 28, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250102866.jpg' },
  { number: 27, name: 'Mickaël Cuisance', position: 'MF', age: 27, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250091018.jpg' },
  // Delanteros
  { number: 7, name: 'Florian Sotoca', position: 'FW', age: 35, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250186121.jpg' },
  { number: 9, name: 'Thorgan Hazard', position: 'FW', age: 33, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250012551.jpg' },
  { number: 10, name: 'Florian Thauvin', position: 'FW', age: 33, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250050319.jpg' },
  { number: 11, name: 'Odsonne Édouard', position: 'FW', age: 28, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076641.jpg' },
  { number: 19, name: 'Abdallah Sima', position: 'FW', age: 25, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250147342.jpg' },
  { number: 28, name: 'Junior Kadile', position: 'FW', age: 23, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118957.jpg' },
  { number: 29, name: 'Franjo Ivanović', position: 'FW', age: 22, club: 'Racing Club de Lens', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169350.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 6, 14, 5, 8, 21, 7, 9, 10],
};
