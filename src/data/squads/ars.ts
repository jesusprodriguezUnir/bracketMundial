import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'David Raya', position: 'GK', age: 30, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171278.jpg' },
  { number: 13, name: 'Kepa Arrizabalaga', position: 'GK', age: 31, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250039900.jpg' },
  { number: 30, name: 'Illan Meslier', position: 'GK', age: 26, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127437.jpg' },
  // Defensores
  { number: 2, name: 'William Saliba', position: 'DF', age: 25, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127439.jpg' },
  { number: 3, name: 'Cristhian Mosquera', position: 'DF', age: 22, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250129972.jpg' },
  { number: 4, name: 'Ben White', position: 'DF', age: 28, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250156002.jpg' },
  { number: 5, name: 'Piero Hincapié', position: 'DF', age: 24, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163454.jpg' },
  { number: 6, name: 'Gabriel', position: 'DF', age: 28, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250131901.jpg' },
  { number: 12, name: 'Jurriën Timber', position: 'DF', age: 25, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101728.jpg' },
  { number: 15, name: 'Ezri Konsa', position: 'DF', age: 28, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123068.jpg' },
  { number: 33, name: 'Riccardo Calafiori', position: 'DF', age: 24, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113392.jpg' },
  // Centrocampistas
  { number: 8, name: 'Martin Ødegaard', position: 'MF', age: 27, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250081341.jpg' },
  { number: 10, name: 'Eberechi Eze', position: 'MF', age: 28, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134376.jpg' },
  { number: 20, name: 'Noni Madueke', position: 'MF', age: 24, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113134.jpg' },
  { number: 23, name: 'Mikel Merino', position: 'MF', age: 30, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250080572.jpg' },
  { number: 29, name: 'Kai Havertz', position: 'MF', age: 27, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250087938.jpg' },
  { number: 36, name: 'Martin Zubimendi', position: 'MF', age: 27, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250143679.jpg' },
  { number: 39, name: 'Bruno Guimarães', position: 'MF', age: 28, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250138893.jpg' },
  { number: 41, name: 'Declan Rice', position: 'MF', age: 27, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250083732.jpg' },
  // Delanteros
  { number: 7, name: 'Bukayo Saka', position: 'FW', age: 25, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106939.jpg' },
  { number: 14, name: 'Viktor Gyökeres', position: 'FW', age: 28, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250105927.jpg' },
  { number: 17, name: 'Christos Tzolis', position: 'FW', age: 24, club: 'Arsenal FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124460.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 5, 8, 10, 20, 7, 14, 17],
};
