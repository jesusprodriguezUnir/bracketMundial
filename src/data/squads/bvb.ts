import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Gregor Kobel', position: 'GK', age: 28, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250069832.jpg' },
  { number: 30, name: 'Patrick Drewes', position: 'GK', age: 33, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250077579.jpg' },
  { number: 31, name: 'Silas Ostrzinski', position: 'GK', age: 22, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153408.jpg' },
  { number: 33, name: 'Alexander Meyer', position: 'GK', age: 35, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174737.jpg' },
  // Defensores
  { number: 3, name: 'Waldemar Anton', position: 'DF', age: 30, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101238.jpg' },
  { number: 4, name: 'Nico Schlotterbeck', position: 'DF', age: 26, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134856.jpg' },
  { number: 5, name: 'Ramy Bensebaini', position: 'DF', age: 31, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250119677.jpg' },
  { number: 22, name: 'Joane Gadou', position: 'DF', age: 19, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250177594.jpg' },
  { number: 24, name: 'Daniel Svensson', position: 'DF', age: 24, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250156423.jpg' },
  { number: 26, name: 'Julian Ryerson', position: 'DF', age: 28, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250092517.jpg' },
  { number: 36, name: 'Kauã Prates', position: 'DF', age: 18, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224143.jpg' },
  { number: 39, name: 'Filippo Mane', position: 'DF', age: 21, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250168729.jpg' },
  { number: 42, name: 'Jan Luca Riedl', position: 'DF', age: 17, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200719.jpg' },
  { number: 47, name: 'Miguel Adje', position: 'DF', age: 18, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250211913.jpg' },
  { number: 49, name: 'Luca Reggiani', position: 'DF', age: 18, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193505.jpg' },
  // Centrocampistas
  { number: 7, name: 'Jobe Bellingham', position: 'MF', age: 20, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250167832.jpg' },
  { number: 8, name: 'Felix Nmecha', position: 'MF', age: 25, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112224.jpg' },
  { number: 17, name: 'Carney Chukwuemeka', position: 'MF', age: 22, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250169276.jpg' },
  { number: 18, name: 'Ethan Nwaneri', position: 'MF', age: 19, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250170117.jpg' },
  { number: 20, name: 'Marcel Sabitzer', position: 'MF', age: 32, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250024349.jpg' },
  { number: 25, name: 'Joey Veerman', position: 'MF', age: 27, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250105890.jpg' },
  { number: 44, name: 'Enzo Duarte', position: 'MF', age: 17, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250203284.jpg' },
  { number: 48, name: 'Mussa Kaba', position: 'MF', age: 17, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200716.jpg' },
  // Delanteros
  { number: 9, name: 'Serhou Guirassy', position: 'FW', age: 30, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250080553.jpg' },
  { number: 14, name: 'Maximilian Beier', position: 'FW', age: 23, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124222.jpg' },
  { number: 19, name: 'Konstantinos Karetsas', position: 'FW', age: 18, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250182174.jpg' },
  { number: 21, name: 'Fábio Silva', position: 'FW', age: 24, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250113350.jpg' },
  { number: 40, name: 'Samuele Inacio', position: 'FW', age: 18, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200715.jpg' },
  { number: 41, name: 'Mathis Albert', position: 'FW', age: 17, club: 'Borussia Dortmund', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250200705.jpg' },
];

export const lineup: Lineup = {
  formation: '3-4-3',
  startingXI: [1, 18, 3, 22, 24, 8, 7, 26, 14, 9, 19],
};
