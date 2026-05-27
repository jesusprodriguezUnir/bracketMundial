import type { Player } from './index';

export const squad: Player[] = [
  { number: 1, name: 'Luis Mejía', position: 'GK', age: 35, club: 'Nacional' },
  { number: 12, name: 'Orlando Mosquera', position: 'GK', age: 31, club: 'Al-Fayha' },
  { number: 23, name: 'César Samudio', position: 'GK', age: 31, club: 'Marathón' },
  { number: 2, name: 'Amir Murillo', position: 'DF', age: 30, club: 'Marseille' },
  { number: 3, name: 'Andrés Andrade', position: 'DF', age: 27, club: 'LASK' },
  { number: 4, name: 'Fidel Escobar', position: 'DF', age: 31, club: 'Deportivo Saprissa', captain: true },
  { number: 5, name: 'José Córdoba', position: 'DF', age: 24, club: 'Norwich City' },
  { number: 13, name: 'Eric Davis', position: 'DF', age: 35, club: 'Vila Nova' },
  { number: 14, name: 'Jorge Gutiérrez', position: 'DF', age: 27, club: 'Deportivo La Guaira' },
  { number: 15, name: 'César Blackman', position: 'DF', age: 27, club: 'Slovan Bratislava' },
  { number: 24, name: 'Edgardo Fariña', position: 'DF', age: 24, club: 'Pari Nizhny Novgorod' },
  { number: 25, name: 'Jiovany Ramos', position: 'DF', age: 29, club: 'Academia Puerto Cabello' },
  { number: 26, name: 'Roderick Miller', position: 'DF', age: 34, club: 'Turan Tovuz' },
  { number: 6, name: 'Adalberto Carrasquilla', position: 'MF', age: 27, club: 'Houston Dynamo' },
  { number: 8, name: 'Cristian Martínez', position: 'MF', age: 29, club: 'Al-Jandal' },
  { number: 10, name: 'Yoel Bárcenas', position: 'MF', age: 32, club: 'Mazatlán' },
  { number: 16, name: 'Aníbal Godoy', position: 'MF', age: 36, club: 'Nashville SC' },
  { number: 17, name: 'José Luis Rodríguez', position: 'MF', age: 27, club: 'Juárez' },
  { number: 18, name: 'Carlos Harvey', position: 'MF', age: 26, club: 'Minnesota United' },
  { number: 19, name: 'Alberto Quintero', position: 'MF', age: 38, club: 'Plaza Amador' },
  { number: 21, name: 'César Yanis', position: 'MF', age: 30, club: 'Cobresal' },
  { number: 22, name: 'Azarías Londoño', position: 'MF', age: 24, club: 'Universidad Católica' },
  { number: 7, name: 'Tomás Rodríguez', position: 'FW', age: 27, club: 'Deportivo Saprissa' },
  { number: 9, name: 'Ismael Díaz', position: 'FW', age: 29, club: 'Universidad Católica de Ecuador' },
  { number: 11, name: 'Cecilio Waterman', position: 'FW', age: 35, club: 'Alianza Lima' },
  { number: 20, name: 'José Fajardo', position: 'FW', age: 32, club: 'Universidad Católica de Ecuador' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 13, 6, 16, 10, 9, 11, 20]
};