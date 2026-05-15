import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Guillermo Ochoa',       position: 'GK', age: 40, club: 'América' },
  { number: 13, name: 'Rodolfo Cota',           position: 'GK', age: 36, club: 'León' },
  { number: 23, name: 'Luis Malagón',           position: 'GK', age: 28, club: 'América' },
  { number: 3,  name: 'César Montes',           position: 'DF', age: 27, club: 'Monterrey' },
  { number: 4,  name: 'Édson Álvarez',          position: 'DF', age: 27, club: 'West Ham' },
  { number: 5,  name: 'Johan Vásquez',          position: 'DF', age: 25, club: 'Génova' },
  { number: 2,  name: 'Jorge Sánchez',          position: 'DF', age: 26, club: 'Porto' },
  { number: 22, name: 'Gerardo Arteaga',        position: 'DF', age: 26, club: 'Getafe' },
  { number: 12, name: 'Kevin Álvarez',          position: 'DF', age: 24, club: 'América' },
  { number: 15, name: 'Israel Reyes',           position: 'DF', age: 24, club: 'América' },
  { number: 6,  name: 'Héctor Herrera',         position: 'MF', age: 36, club: 'Houston Dynamo', captain: true },
  { number: 8,  name: 'Carlos Rodríguez',       position: 'MF', age: 28, club: 'Cruz Azul' },
  { number: 16, name: 'Orbelín Pineda',         position: 'MF', age: 29, club: 'AEK Atenas' },
  { number: 18, name: 'Luis Romo',              position: 'MF', age: 29, club: 'Monterrey' },
  { number: 14, name: 'Erick Gutiérrez',        position: 'MF', age: 30, club: 'PSVB / León' },
  { number: 19, name: 'Roberto Alvarado',       position: 'MF', age: 26, club: 'Chivas' },
  { number: 17, name: 'Sebastián Córdova',      position: 'MF', age: 27, club: 'Tigres' },
  { number: 24, name: 'Óscar Cortés',           position: 'MF', age: 21, club: 'Lens' },
  { number: 7,  name: 'Hirving Lozano',         position: 'FW', age: 30, club: 'SD Eibar' },
  { number: 9,  name: 'Raúl Jiménez',           position: 'FW', age: 34, club: 'Fulham' },
  { number: 10, name: 'Alexis Vega',            position: 'FW', age: 28, club: 'Chivas' },
  { number: 11, name: 'Uriel Antuna',           position: 'FW', age: 26, club: 'Cruz Azul' },
  { number: 20, name: 'Santiago Giménez',       position: 'FW', age: 24, club: 'Milan' },
  { number: 21, name: 'Henry Martín',           position: 'FW', age: 31, club: 'América' },
  { number: 25, name: 'Julián Quiñones',        position: 'FW', age: 28, club: 'América' },
  { number: 26, name: 'Fidel Ambriz',           position: 'FW', age: 22, club: 'Pachuca' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 5, 22, 4, 18, 16, 7, 20, 10]
};
