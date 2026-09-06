import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Juan Musso', position: 'GK', age: 32, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250137521.jpg' },
  { number: 13, name: 'Jan Oblak', position: 'GK', age: 33, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250012069.jpg' },
  // Defensores
  { number: 17, name: 'Dávid Hancko', position: 'DF', age: 28, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250092668.jpg' },
  { number: 18, name: 'Marc Pubill', position: 'DF', age: 23, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250194472.jpg' },
  { number: 21, name: 'Cristian Romero', position: 'DF', age: 28, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250144325.jpg' },
  { number: 22, name: 'Alejandro Grimaldo', position: 'DF', age: 30, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042422.jpg' },
  { number: 24, name: 'Robin Le Normand', position: 'DF', age: 29, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250112513.jpg' },
  { number: 30, name: 'Dani Martinez', position: 'DF', age: 22, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250176826.jpg' },
  { number: 32, name: 'Arnau Solà', position: 'DF', age: 23, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250135429.jpg' },
  // Centrocampistas
  { number: 3, name: 'Obed Vargas', position: 'MF', age: 21, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250216944.jpg' },
  { number: 4, name: 'Rodrigo Mendoza', position: 'MF', age: 21, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250172343.jpg' },
  { number: 5, name: 'Johnny Cardoso', position: 'MF', age: 24, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250150915.jpg' },
  { number: 6, name: 'Koke', position: 'MF', age: 34, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/1909917.jpg' },
  { number: 7, name: 'Kang-in Lee', position: 'MF', age: 25, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250121584.jpg' },
  { number: 8, name: 'Pablo Barrios', position: 'MF', age: 23, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250139036.jpg' },
  { number: 10, name: 'Álex Baena', position: 'MF', age: 25, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106963.jpg' },
  { number: 14, name: 'Marcos Llorente', position: 'MF', age: 31, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250079670.jpg' },
  { number: 23, name: 'Morten Hjulmand', position: 'MF', age: 27, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250101557.jpg' },
  // Delanteros
  { number: 9, name: 'Alexander Sørloth', position: 'FW', age: 30, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250061361.jpg' },
  { number: 11, name: 'Ademola Lookman', position: 'FW', age: 28, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250099258.jpg' },
  { number: 15, name: 'Jonathan David', position: 'FW', age: 26, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250102035.jpg' },
  { number: 16, name: 'Arnau Ortiz', position: 'FW', age: 24, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197651.jpg' },
  { number: 19, name: 'Julián Alvarez', position: 'FW', age: 26, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250172668.jpg' },
  { number: 20, name: 'Giuliano Simeone', position: 'FW', age: 23, club: 'Club Atlético de Madrid', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250153634.jpg' },
];

export const lineup: Lineup = {
  formation: '5-2-3',
  startingXI: [13, 22, 17, 24, 18, 14, 23, 8, 11, 10, 7],
};
