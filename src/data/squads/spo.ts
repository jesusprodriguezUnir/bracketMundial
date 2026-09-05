import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Rui Silva', position: 'GK', age: 32, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250062141.jpg' },
  { number: 30, name: 'Kaique Pereira', position: 'GK', age: 23, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224837.jpg' },
  { number: 41, name: 'Diego Callai', position: 'GK', age: 22, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250160990.jpg' },
  // Defensores
  { number: 5, name: 'Sergi Altimira', position: 'DF', age: 25, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130006.jpg' },
  { number: 6, name: 'Zeno Debast', position: 'DF', age: 22, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250137390.jpg' },
  { number: 13, name: 'Giorgos Vagiannidis', position: 'DF', age: 24, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187284.jpg' },
  { number: 18, name: 'Moncef Zekri', position: 'DF', age: 17, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224838.jpg' },
  { number: 22, name: 'Iván Fresneda', position: 'DF', age: 21, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250179137.jpg' },
  { number: 25, name: 'Gonçalo Inácio', position: 'DF', age: 25, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250136464.jpg' },
  { number: 55, name: 'Ibrahima Ba', position: 'DF', age: 21, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223275.jpg' },
  { number: 72, name: 'Eduardo Quaresma', position: 'DF', age: 24, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250117415.jpg' },
  // Centrocampistas
  { number: 4, name: 'Silas Andersen', position: 'MF', age: 22, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139182.jpg' },
  { number: 17, name: 'Rodrigo Zalazar', position: 'MF', age: 27, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187727.jpg' },
  { number: 20, name: 'Maximiliano Araújo', position: 'MF', age: 26, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200231.jpg' },
  { number: 21, name: 'Pedro Lima', position: 'MF', age: 23, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197406.jpg' },
  { number: 77, name: 'Issa Doumbia', position: 'MF', age: 22, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250208842.jpg' },
  { number: 96, name: 'Samuel Justo', position: 'MF', age: 22, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250164927.jpg' },
  // Delanteros
  { number: 7, name: 'Fotis Ioannidis', position: 'FW', age: 26, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127400.jpg' },
  { number: 10, name: 'Geny Catamo', position: 'FW', age: 25, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250145845.jpg' },
  { number: 11, name: 'Nuno Santos', position: 'FW', age: 31, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064482.jpg' },
  { number: 19, name: 'Nestory Irankunda', position: 'FW', age: 20, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250198116.jpg' },
  { number: 28, name: 'Jesse Derry', position: 'FW', age: 19, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250192702.jpg' },
  { number: 31, name: 'Luis Guilherme', position: 'FW', age: 20, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216956.jpg' },
  { number: 76, name: 'Rodrigo Rodrigues', position: 'FW', age: 18, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250218236.jpg' },
  { number: 97, name: 'Luis Suárez', position: 'FW', age: 28, club: 'Sporting Clube de Portugal', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250147458.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 5, 6, 13, 18, 4, 17, 20, 7, 10, 11],
};
