import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alvaro Valles', position: 'GK', age: 29, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212322.jpg' },
  { number: 13, name: 'Diego Conde', position: 'GK', age: 27, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076131.jpg' },
  // Defensores
  { number: 2, name: 'Héctor Bellerín', position: 'DF', age: 31, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250047082.jpg' },
  { number: 3, name: 'Diego Llorente', position: 'DF', age: 33, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250057121.jpg' },
  { number: 4, name: 'Natan', position: 'DF', age: 25, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187998.jpg' },
  { number: 5, name: 'Marc Bartra', position: 'DF', age: 35, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250010245.jpg' },
  { number: 11, name: 'Fran García', position: 'DF', age: 27, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250091175.jpg' },
  { number: 12, name: 'Angel Ortiz', position: 'DF', age: 22, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250178134.jpg' },
  { number: 16, name: 'Valentin Gomez', position: 'DF', age: 23, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212314.jpg' },
  { number: 23, name: 'Junior Firpo', position: 'DF', age: 30, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250122839.jpg' },
  // Centrocampistas
  { number: 6, name: 'Facundo Bernal', position: 'MF', age: 23, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250221822.jpg' },
  { number: 8, name: 'Pablo Fornals', position: 'MF', age: 30, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250092715.jpg' },
  { number: 14, name: 'Iker Losada', position: 'MF', age: 25, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153599.jpg' },
  { number: 15, name: 'Álvaro Fidalgo', position: 'MF', age: 29, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076692.jpg' },
  { number: 17, name: 'Rodrigo Riquelme', position: 'MF', age: 26, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101313.jpg' },
  { number: 18, name: 'Nelson Deossa', position: 'MF', age: 26, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212313.jpg' },
  { number: 20, name: 'Giovani Lo Celso', position: 'MF', age: 30, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250100013.jpg' },
  { number: 21, name: 'Marc Roca', position: 'MF', age: 29, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123073.jpg' },
  { number: 22, name: 'Isco', position: 'MF', age: 34, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/150711837.jpg' },
  { number: 25, name: 'Dani Ceballos', position: 'MF', age: 30, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250086709.jpg' },
  // Delanteros
  { number: 7, name: 'Antony', position: 'FW', age: 26, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144211.jpg' },
  { number: 9, name: 'Cucho Hernández', position: 'FW', age: 27, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212316.jpg' },
  { number: 10, name: 'Abde Ezzalzouli', position: 'FW', age: 24, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174874.jpg' },
  { number: 19, name: 'Troy Parrott', position: 'FW', age: 24, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250109003.jpg' },
  { number: 24, name: 'Aitor Ruibal', position: 'FW', age: 30, club: 'Real Betis Balompié', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250163279.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 5, 6, 8, 14, 7, 9, 10],
};
