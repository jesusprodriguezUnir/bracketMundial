import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Thibaut Courtois', position: 'GK', age: 34, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250011668.jpg' },
  { number: 13, name: 'Andriy Lunin', position: 'GK', age: 27, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250089824.jpg' },
  { number: 26, name: 'Sergio Mestre', position: 'GK', age: 21, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250154301.jpg' },
  { number: 31, name: 'Javi Navarro', position: 'GK', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250201421.jpg' },
  // Defensores
  { number: 2, name: 'Raúl Asencio', position: 'DF', age: 23, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153617.jpg' },
  { number: 3, name: 'Éder Militão', position: 'DF', age: 28, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250121965.jpg' },
  { number: 4, name: 'Dean Huijsen', position: 'DF', age: 21, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194474.jpg' },
  { number: 12, name: 'Trent Alexander-Arnold', position: 'DF', age: 27, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076357.jpg' },
  { number: 16, name: 'Ibrahima Konaté', position: 'DF', age: 27, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250091013.jpg' },
  { number: 17, name: 'Marc Cucurella', position: 'DF', age: 28, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076168.jpg' },
  { number: 18, name: 'Álvaro Carreras', position: 'DF', age: 23, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153945.jpg' },
  { number: 22, name: 'Antonio Rüdiger', position: 'DF', age: 33, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250028211.jpg' },
  { number: 24, name: 'Denzel Dumfries', position: 'DF', age: 30, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112690.jpg' },
  { number: 28, name: 'Jesus Fortea', position: 'DF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250179703.jpg' },
  { number: 30, name: 'Joan Martínez', position: 'DF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250191276.jpg' },
  { number: 33, name: 'Mario Rivas', position: 'DF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193666.jpg' },
  // Centrocampistas
  { number: 5, name: 'Jude Bellingham', position: 'MF', age: 23, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128377.jpg' },
  { number: 6, name: 'Eduardo Camavinga', position: 'MF', age: 23, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128270.jpg' },
  { number: 8, name: 'Federico Valverde', position: 'MF', age: 28, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101284.jpg' },
  { number: 14, name: 'Aurélien Tchouaméni', position: 'MF', age: 26, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250105244.jpg' },
  { number: 15, name: 'Arda Güler', position: 'MF', age: 21, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250161881.jpg' },
  { number: 20, name: 'Bernardo Silva', position: 'MF', age: 32, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250059115.jpg' },
  { number: 25, name: 'Yan Diomande', position: 'MF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250220373.jpg' },
  { number: 27, name: 'Thiago Pitarch', position: 'MF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250205688.jpg' },
  { number: 29, name: 'Jorge Cestero', position: 'MF', age: 20, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189623.jpg' },
  { number: 32, name: 'Diego Villalba', position: 'MF', age: 18, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250206694.jpg' },
  { number: 37, name: 'Gabriel Valero', position: 'MF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213264.jpg' },
  { number: 38, name: 'Sergio Martínez', position: 'MF', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225046.jpg' },
  // Delanteros
  { number: 7, name: 'Vinícius Júnior', position: 'FW', age: 26, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250121533.jpg' },
  { number: 9, name: 'Endrick', position: 'FW', age: 20, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194573.jpg' },
  { number: 10, name: 'Kylian Mbappé', position: 'FW', age: 27, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076574.jpg' },
  { number: 11, name: 'Rodrygo', position: 'FW', age: 25, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132829.jpg' },
  { number: 19, name: 'Carlos Espi', position: 'FW', age: 21, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223168.jpg' },
  { number: 21, name: 'Brahim Díaz', position: 'FW', age: 27, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088039.jpg' },
  { number: 35, name: 'Daniel Yañez', position: 'FW', age: 19, club: 'Real Madrid CF', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189858.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 12, 5, 6, 8, 7, 9, 10],
};
