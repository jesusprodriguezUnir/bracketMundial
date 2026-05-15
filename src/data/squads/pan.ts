import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Luis Mejía', position: 'GK', age: 34, club: 'Nacional' },
  { number: 12, name: 'Orlando Mosquera', position: 'GK', age: 31, club: 'Maccabi Tel Aviv' },
  { number: 23, name: 'César Samudio', position: 'GK', age: 31, club: 'Marathón' },
  { number: 2, name: 'Michael Murillo', position: 'DF', age: 30, club: 'Marseille' },
  { number: 3, name: 'Andrés Andrade', position: 'DF', age: 27, club: 'Arminia Bielefeld' },
  { number: 4, name: 'Fidel Escobar', position: 'DF', age: 31, club: 'Deportivo Saprissa', captain: true },
  { number: 5, name: 'José Córdoba', position: 'DF', age: 24, club: 'Norwich City' },
  { number: 13, name: 'Eric Davis', position: 'DF', age: 35, club: 'Košice' },
  { number: 14, name: 'Harold Cummings', position: 'DF', age: 33, club: 'Always Ready' },
  { number: 15, name: 'César Blackman', position: 'DF', age: 27, club: 'Slovan Bratislava' },
  { number: 6, name: 'Adalberto Carrasquilla', position: 'MF', age: 28, club: 'Pumas UNAM' },
  { number: 8, name: 'Cristian Martínez', position: 'MF', age: 29, club: 'Plaza Amador' },
  { number: 10, name: 'Édgar Bárcenas', position: 'MF', age: 32, club: 'Mazatlán' },
  { number: 16, name: 'Aníbal Godoy', position: 'MF', age: 35, club: 'Nashville SC' },
  { number: 17, name: 'José Luis Rodríguez', position: 'MF', age: 27, club: 'FC Juárez' },
  { number: 18, name: 'Abdiel Ayarza', position: 'MF', age: 32, club: 'Cienciano' },
  { number: 7, name: 'Yoel Bárcenas', position: 'FW', age: 32, club: 'Mazatlán' },
  { number: 9, name: 'Ismael Díaz', position: 'FW', age: 29, club: 'Universidad Católica de Ecuador' },
  { number: 11, name: 'Cecilio Waterman', position: 'FW', age: 34, club: 'Alianza Lima' },
  { number: 19, name: 'Eduardo Guerrero', position: 'FW', age: 25, club: 'Dynamo Kyiv' },
  { number: 20, name: 'José Fajardo', position: 'FW', age: 32, club: 'Universidad Católica de Ecuador' },
  { number: 21, name: 'Freddy Góndola', position: 'FW', age: 30, club: 'McAllen Toros' },
  { number: 22, name: 'Kahiser Lenis', position: 'FW', age: 24, club: 'Jaguares de Córdoba' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 13, 6, 16, 10, 7, 9, 11]
};