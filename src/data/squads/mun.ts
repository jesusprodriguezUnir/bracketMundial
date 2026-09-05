import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Senne Lammens', position: 'GK', age: 24, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250118908.jpg' },
  { number: 12, name: 'Karl Darlow', position: 'GK', age: 35, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250021790.jpg' },
  { number: 22, name: 'Tom Heaton', position: 'GK', age: 40, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/69582.jpg' },
  { number: 45, name: 'Dermot Mee', position: 'GK', age: 23, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250128702.jpg' },
  // Defensores
  { number: 2, name: 'Diogo Dalot', position: 'DF', age: 27, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250081628.jpg' },
  { number: 3, name: 'Noussair Mazraoui', position: 'DF', age: 28, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250075995.jpg' },
  { number: 4, name: 'Matthijs de Ligt', position: 'DF', age: 27, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/50327424.jpg' },
  { number: 5, name: 'Harry Maguire', position: 'DF', age: 33, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250075007.jpg' },
  { number: 6, name: 'Lisandro Martínez', position: 'DF', age: 28, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250132803.jpg' },
  { number: 13, name: 'Patrick Dorgu', position: 'DF', age: 21, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250178823.jpg' },
  { number: 23, name: 'Luke Shaw', position: 'DF', age: 31, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250042705.jpg' },
  // Centrocampistas
  { number: 7, name: 'Mason Mount', position: 'MF', age: 27, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250076240.jpg' },
  { number: 8, name: 'Bruno Fernandes', position: 'MF', age: 31, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250078886.jpg' },
  { number: 17, name: 'Andrey Santos', position: 'MF', age: 22, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250182090.jpg' },
  { number: 18, name: 'Youri Tielemans', position: 'MF', age: 29, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250064006.jpg' },
  { number: 20, name: 'Carlos Baleba', position: 'MF', age: 22, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188249.jpg' },
  { number: 25, name: 'Manuel Ugarte', position: 'MF', age: 25, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250161762.jpg' },
  { number: 26, name: 'Ayden Heaven', position: 'MF', age: 19, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250189295.jpg' },
  // Delanteros
  { number: 9, name: 'Marcus Rashford', position: 'FW', age: 28, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250088246.jpg' },
  { number: 10, name: 'Matheus Cunha', position: 'FW', age: 27, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250110943.jpg' },
  { number: 11, name: 'Joshua Zirkzee', position: 'FW', age: 25, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250106762.jpg' },
  { number: 16, name: 'Amad Diallo', position: 'FW', age: 24, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250121405.jpg' },
  { number: 19, name: 'Bryan Mbeumo', position: 'FW', age: 27, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250137260.jpg' },
  { number: 27, name: 'Tynan Thompson', position: 'FW', age: 18, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250213748.jpg' },
  { number: 30, name: 'Benjamin Šeško', position: 'FW', age: 23, club: 'Manchester United FC', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250127111.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 5, 7, 8, 17, 9, 10, 11],
};
