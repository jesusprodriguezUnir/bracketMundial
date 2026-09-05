import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Josep Martínez', position: 'GK', age: 28, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250096761.jpg' },
  { number: 12, name: 'Raffaele Di Gennaro', position: 'GK', age: 32, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250017814.jpg' },
  { number: 49, name: 'Ivan Provedel', position: 'GK', age: 32, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088946.jpg' },
  // Defensores
  { number: 6, name: 'John Stones', position: 'DF', age: 32, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064233.jpg' },
  { number: 25, name: 'Manuel Akanji', position: 'DF', age: 31, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250085369.jpg' },
  { number: 28, name: 'Benjamin Pavard', position: 'DF', age: 30, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250081921.jpg' },
  { number: 30, name: 'Carlos Augusto', position: 'DF', age: 27, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188223.jpg' },
  { number: 31, name: 'Yann Bisseck', position: 'DF', age: 25, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116951.jpg' },
  { number: 32, name: 'Federico Dimarco', position: 'DF', age: 28, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250056189.jpg' },
  { number: 54, name: 'Mattia Marello', position: 'DF', age: 18, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250211929.jpg' },
  { number: 95, name: 'Alessandro Bastoni', position: 'DF', age: 27, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250091199.jpg' },
  { number: 99, name: 'Djed Spence', position: 'DF', age: 26, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250171293.jpg' },
  // Centrocampistas
  { number: 7, name: 'Piotr Zieliński', position: 'MF', age: 32, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250024370.jpg' },
  { number: 8, name: 'Petar Sučić', position: 'MF', age: 22, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135339.jpg' },
  { number: 17, name: 'Andy Diouf', position: 'MF', age: 23, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250136353.jpg' },
  { number: 20, name: 'Hakan Çalhanoğlu', position: 'MF', age: 32, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250022829.jpg' },
  { number: 21, name: 'Curtis Jones', position: 'MF', age: 25, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106935.jpg' },
  { number: 22, name: 'Henrikh Mkhitaryan', position: 'MF', age: 37, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/98023.jpg' },
  { number: 23, name: 'Nicolò Barella', position: 'MF', age: 29, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250066739.jpg' },
  // Delanteros
  { number: 9, name: 'Marcus Thuram', position: 'FW', age: 29, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250068805.jpg' },
  { number: 10, name: 'Lautaro Martínez', position: 'FW', age: 29, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118281.jpg' },
  { number: 11, name: 'Luis Henrique', position: 'FW', age: 24, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250146919.jpg' },
  { number: 14, name: 'Ange-Yoan Bonny', position: 'FW', age: 22, club: 'FC Internazionale Milano', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250173062.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 6, 25, 28, 30, 7, 8, 17, 9, 10, 11],
};
