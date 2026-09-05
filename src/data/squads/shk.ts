import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 23, name: 'Kiril Fesiun', position: 'GK', age: 24, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250160835.jpg' },
  { number: 31, name: 'Dmytro Riznyk', position: 'GK', age: 27, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250121017.jpg' },
  { number: 34, name: 'Rostyslav Bahlai', position: 'GK', age: 18, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188875.jpg' },
  // Defensores
  { number: 4, name: 'Marlon Santos', position: 'DF', age: 30, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101096.jpg' },
  { number: 5, name: 'Valeriy Bondar', position: 'DF', age: 27, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250087118.jpg' },
  { number: 13, name: 'Pedro Henrique', position: 'DF', age: 24, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187672.jpg' },
  { number: 16, name: 'Irakli Azarov', position: 'DF', age: 24, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250108031.jpg' },
  { number: 17, name: 'Vinícius Tobías', position: 'DF', age: 22, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176491.jpg' },
  { number: 18, name: 'Alaa Ghram', position: 'DF', age: 25, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194557.jpg' },
  { number: 20, name: 'Oleksandr Karavaiev', position: 'DF', age: 34, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250004740.jpg' },
  { number: 22, name: 'Mykola Matviyenko', position: 'DF', age: 30, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064444.jpg' },
  // Centrocampistas
  { number: 6, name: 'Marlon Gomes', position: 'MF', age: 22, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250193518.jpg' },
  { number: 8, name: 'Dmytro Kryskiv', position: 'MF', age: 25, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112978.jpg' },
  { number: 10, name: 'Pedrinho', position: 'MF', age: 28, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144964.jpg' },
  { number: 11, name: 'Newertton', position: 'MF', age: 21, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250187671.jpg' },
  { number: 14, name: 'Isaque', position: 'MF', age: 19, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212206.jpg' },
  { number: 24, name: 'Viktor Tsukanov', position: 'MF', age: 20, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176838.jpg' },
  { number: 25, name: 'Gabriel Carvalho', position: 'MF', age: 19, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224147.jpg' },
  { number: 27, name: 'Oleh Ocheretko', position: 'MF', age: 23, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250134776.jpg' },
  { number: 29, name: 'Yehor Nazaryna', position: 'MF', age: 29, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250123440.jpg' },
  { number: 30, name: 'Alisson Santana', position: 'MF', age: 20, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209228.jpg' },
  { number: 37, name: 'Lucas Ferreira', position: 'MF', age: 20, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250211402.jpg' },
  { number: 45, name: 'Denys Smetana', position: 'MF', age: 20, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176861.jpg' },
  { number: 71, name: 'Ryan Roberto', position: 'MF', age: 18, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250211683.jpg' },
  { number: 77, name: 'Gleiker Mendoza', position: 'MF', age: 24, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250220576.jpg' },
  { number: 99, name: 'Bruninho', position: 'MF', age: 18, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224146.jpg' },
  // Delanteros
  { number: 2, name: 'Lassina Traoré', position: 'FW', age: 25, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128222.jpg' },
  { number: 9, name: 'Kauã Elias', position: 'FW', age: 20, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250209227.jpg' },
  { number: 49, name: 'Luca Meirelles', position: 'FW', age: 19, club: 'FK Shakhtar Donetsk', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250212190.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [23, 4, 5, 13, 16, 6, 8, 10, 2, 9, 49],
};
