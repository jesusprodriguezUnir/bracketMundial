import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Raúl Rangel', position: 'GK', age: 26, club: 'Guadalajara' },
  { number: 12, name: 'Carlos Acevedo', position: 'GK', age: 30, club: 'Santos Laguna' },
  { number: 13, name: 'Guillermo Ochoa', position: 'GK', age: 40, club: 'Limassol' },
  // Defensores
  { number: 2, name: 'Jorge Sánchez', position: 'DF', age: 28, club: 'PAOK' },
  { number: 3, name: 'César Montes', position: 'DF', age: 29, club: 'Lokomotiv Moscow', captain: true },
  { number: 5, name: 'Johan Vásquez', position: 'DF', age: 27, club: 'Genoa' },
  { number: 15, name: 'Israel Reyes', position: 'DF', age: 25, club: 'América' },
  { number: 20, name: 'Mateo Chávez', position: 'DF', age: 21, club: 'AZ Alkmaar' },
  { number: 23, name: 'Jesús Gallardo', position: 'DF', age: 31, club: 'Toluca' },
  // Volantes
  { number: 4, name: 'Edson Álvarez', position: 'MF', age: 0, club: 'Fenerbahce' },
  { number: 6, name: 'Erik Lira', position: 'MF', age: 25, club: 'Cruz Azul' },
  { number: 7, name: 'Luis Romo', position: 'MF', age: 31, club: 'Guadalajara' },
  { number: 8, name: 'Álvaro Fidalgo', position: 'MF', age: 28, club: 'Real Betis' },
  { number: 17, name: 'Orbelín Pineda', position: 'MF', age: 30, club: 'AEK Athens' },
  { number: 18, name: 'Obed Vargas', position: 'MF', age: 21, club: 'Atlético Madrid' },
  { number: 19, name: 'Gilberto Mora', position: 'MF', age: 0, club: 'Club Tijuana' },
  { number: 24, name: 'Luis Chávez', position: 'MF', age: 0, club: 'Dynamo Moscow' },
  { number: 26, name: 'Brian Gutiérrez', position: 'MF', age: 23, club: 'Guadalajara' },
  // Delanteros
  { number: 9, name: 'Raúl Jiménez', position: 'FW', age: 35, club: 'Fulham' },
  { number: 10, name: 'Alexis Vega', position: 'FW', age: 28, club: 'Toluca' },
  { number: 11, name: 'Santiago Gimenez', position: 'FW', age: 0, club: 'Milan' },
  { number: 14, name: 'Armando González', position: 'FW', age: 23, club: 'Guadalajara' },
  { number: 16, name: 'Julián Quiñones', position: 'FW', age: 29, club: 'Al-Qadsiah' },
  { number: 21, name: 'César Huerta', position: 'FW', age: 26, club: 'Anderlecht' },
  { number: 22, name: 'Guillermo Martínez', position: 'FW', age: 31, club: 'Pumas' },
  { number: 25, name: 'Roberto Alvarado', position: 'FW', age: 27, club: 'Guadalajara' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 5, 2, 18, 8, 17, 16, 10]
};
