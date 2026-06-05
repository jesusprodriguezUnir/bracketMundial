import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Luis Mejía', position: 'GK', age: 35, club: 'Nacional' },
  { number: 12, name: 'César Samudio', position: 'GK', age: 31, club: 'Marathón' },
  { number: 22, name: 'Orlando Mosquera', position: 'GK', age: 31, club: 'Al-Fayha' },
  // Defensores
  { number: 2, name: 'César Blackman', position: 'DF', age: 28, club: 'Slovan Bratislava' },
  { number: 3, name: 'José Córdoba', position: 'DF', age: 25, club: 'Norwich' },
  { number: 4, name: 'Fidel Escobar', position: 'DF', age: 30, club: 'Saprissa', captain: true },
  { number: 5, name: 'Edgardo Fariña', position: 'DF', age: 24, club: 'Nizhny Novgorod' },
  { number: 13, name: 'Jiovany Ramos', position: 'DF', age: 29, club: 'Academia Puerto Cabello' },
  { number: 15, name: 'Eric Davis', position: 'DF', age: 35, club: 'Plaza Amador' },
  { number: 16, name: 'Andrés Andrade', position: 'DF', age: 27, club: 'LASK' },
  { number: 23, name: 'Michael Amir Murillo', position: 'DF', age: 29, club: 'Besiktas' },
  { number: 25, name: 'Roderick Miller', position: 'DF', age: 34, club: 'Turan Tovuz' },
  { number: 26, name: 'Jorge Gutiérrez', position: 'DF', age: 28, club: 'Deportivo La Guaira' },
  // Volantes
  { number: 6, name: 'Cristian Martínez', position: 'MF', age: 29, club: 'Kiryat Shmona' },
  { number: 8, name: 'Adalberto Carrasquilla', position: 'MF', age: 27, club: 'Pumas' },
  { number: 14, name: 'Carlos Harvey', position: 'MF', age: 26, club: 'Minnesota United' },
  { number: 20, name: 'Aníbal Godoy', position: 'MF', age: 35, club: 'San Diego FC' },
  // Delanteros
  { number: 7, name: 'José Luis Rodríguez', position: 'FW', age: 27, club: 'FC Juárez' },
  { number: 9, name: 'Tomás Rodríguez', position: 'FW', age: 26, club: 'Saprissa' },
  { number: 10, name: 'Ismael Díaz', position: 'FW', age: 28, club: 'Club León' },
  { number: 11, name: 'Édgar Yoel Bárcenas', position: 'FW', age: 32, club: 'Mazatlán' },
  { number: 17, name: 'José Fajardo', position: 'FW', age: 32, club: 'Universidad Católica' },
  { number: 18, name: 'Cecilio Waterman', position: 'FW', age: 35, club: 'Universidad de Concepción' },
  { number: 19, name: 'Alberto Quintero', position: 'FW', age: 38, club: 'Plaza Amador' },
  { number: 21, name: 'César Yanis', position: 'FW', age: 30, club: 'Cobresal' },
  { number: 24, name: 'Azarías Londoño', position: 'FW', age: 24, club: 'Universidad Católica' },
];

export const lineup = {
  formation: '3-4-3',
  startingXI: [22, 16, 4, 14, 15, 8, 20, 23, 6, 17, 10]
};
