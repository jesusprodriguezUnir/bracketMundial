import type { Player, Lineup } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Lukas Jungwirth', position: 'GK', age: 22, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188376.jpg' },
  { number: 33, name: 'Tobias Schützenauer', position: 'GK', age: 29, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250065421.jpg' },
  { number: 39, name: 'Christof Katzmayr', position: 'GK', age: 18, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250206921.jpg' },
  { number: 50, name: 'Fabian Schillinger', position: 'GK', age: 19, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250184503.jpg' },
  // Defensores
  { number: 2, name: 'George Bello', position: 'DF', age: 24, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250188092.jpg' },
  { number: 3, name: 'Miguel Freckleton', position: 'DF', age: 23, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223202.jpg' },
  { number: 4, name: 'Xavier Mbuyamba', position: 'DF', age: 24, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250137804.jpg' },
  { number: 16, name: 'Andres Andrade', position: 'DF', age: 27, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250133203.jpg' },
  { number: 20, name: 'Kasper Jørgensen', position: 'DF', age: 26, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116667.jpg' },
  { number: 21, name: 'Manoël Verhaeghe', position: 'DF', age: 18, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250217987.jpg' },
  { number: 23, name: 'Daniel Elfadli', position: 'DF', age: 29, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250225138.jpg' },
  { number: 25, name: 'Yvan Dibango', position: 'DF', age: 24, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250197947.jpg' },
  { number: 31, name: 'Jakob Wansch', position: 'DF', age: 17, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223434.jpg' },
  { number: 36, name: 'Ryan Rodriguez German', position: 'DF', age: 18, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250195616.jpg' },
  { number: 38, name: 'Luca Ortner', position: 'DF', age: 18, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223433.jpg' },
  { number: 43, name: 'Joao Victor Tornich', position: 'DF', age: 23, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223204.jpg' },
  { number: 46, name: 'Armin Midzic', position: 'DF', age: 20, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250199268.jpg' },
  { number: 47, name: 'Jonas Ilk', position: 'DF', age: 19, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250184494.jpg' },
  { number: 49, name: 'Alan Wimmer', position: 'DF', age: 18, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223435.jpg' },
  // Centrocampistas
  { number: 6, name: 'Melayro Bogarde', position: 'MF', age: 24, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250124223.jpg' },
  { number: 9, name: 'Kryštof Daněk', position: 'MF', age: 23, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250130771.jpg' },
  { number: 10, name: 'Robert Ljubičić', position: 'MF', age: 27, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250143322.jpg' },
  { number: 18, name: 'Alessandro Schöpf', position: 'MF', age: 32, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250050403.jpg' },
  { number: 27, name: 'Christoph Lang', position: 'MF', age: 24, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250162184.jpg' },
  { number: 29, name: 'Florian Flecker', position: 'MF', age: 30, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250159904.jpg' },
  { number: 30, name: 'Sascha Horvath', position: 'MF', age: 30, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250055894.jpg' },
  // Delanteros
  { number: 7, name: 'Samuel Adeniran', position: 'FW', age: 27, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223201.jpg' },
  { number: 8, name: 'Moses Usor', position: 'FW', age: 24, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250174644.jpg' },
  { number: 11, name: 'Sasa Kalajdzic', position: 'FW', age: 29, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250116789.jpg' },
  { number: 32, name: 'Matthias Hartl', position: 'FW', age: 16, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250223432.jpg' },
  { number: 40, name: 'Paul Krapf', position: 'FW', age: 18, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250217981.jpg' },
  { number: 45, name: 'Nael Kane', position: 'FW', age: 20, club: 'LASK Linz', photoUrl: 'https://img.uefa.com/imgml/TP/players/1/2027/324x324/250224881.jpg' },
];

export const lineup: Lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 16, 6, 9, 10, 7, 8, 11],
};
