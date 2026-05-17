import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Raúl Rangel', position: 'GK', age: 26, club: 'Chivas' },
  { number: 12, name: 'Guillermo Ochoa', position: 'GK', age: 40, club: 'AEL Limassol' },
  { number: 13, name: 'Carlos Acevedo', position: 'GK', age: 30, club: 'Santos Laguna' },

  // Defensas
  { number: 3, name: 'César Montes', position: 'DF', age: 29, club: 'Lokomotiv Moscú' },
  { number: 5, name: 'Johan Vásquez', position: 'DF', age: 27, club: 'Genoa' },
  { number: 2, name: 'Jorge Sánchez', position: 'DF', age: 28, club: 'PAOK' },
  { number: 22, name: 'Mateo Chávez', position: 'DF', age: 21, club: 'AZ Alkmaar' },
  { number: 23, name: 'Jesús Gallardo', position: 'DF', age: 31, club: 'Toluca' },
  { number: 15, name: 'Israel Reyes', position: 'DF', age: 25, club: 'América' },
  { number: 18, name: 'Luis Romo', position: 'DF', age: 30, club: 'Chivas' },

  // Mediocampistas
  { number: 4, name: 'Edson Álvarez', position: 'MF', age: 28, club: 'Fenerbahce', captain: true },
  { number: 8, name: 'Álvaro Fidalgo', position: 'MF', age: 29, club: 'Real Betis' },
  { number: 24, name: 'Luis Chávez', position: 'MF', age: 30, club: 'Dinamo Moscú' },
  { number: 6, name: 'Obed Vargas', position: 'MF', age: 20, club: 'Atlético de Madrid' },
  { number: 16, name: 'Orbelín Pineda', position: 'MF', age: 30, club: 'AEK Atenas' },
  { number: 21, name: 'Brian Gutiérrez', position: 'MF', age: 23, club: 'Chivas' },
  { number: 14, name: 'Erik Lira', position: 'MF', age: 26, club: 'Cruz Azul' },
  { number: 25, name: 'Gilberto Mora', position: 'MF', age: 17, club: 'Tijuana' },

  // Delanteros
  { number: 11, name: 'Santiago Giménez', position: 'FW', age: 25, club: 'AC Milan' },
  { number: 9, name: 'Raúl Jiménez', position: 'FW', age: 35, club: 'Fulham' },
  { number: 33, name: 'Julián Quiñones', position: 'FW', age: 29, club: 'Al-Qadsiah' },
  { number: 20, name: 'César Huerta', position: 'FW', age: 25, club: 'Anderlecht' },
  { number: 19, name: 'Roberto Alvarado', position: 'FW', age: 27, club: 'Chivas' },
  { number: 10, name: 'Alexis Vega', position: 'FW', age: 28, club: 'Toluca' },
  { number: 17, name: 'Armando González', position: 'FW', age: 23, club: 'Chivas' },
  { number: 26, name: 'Guillermo Martínez', position: 'FW', age: 31, club: 'Pumas' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 5, 22, 4, 8, 16, 11, 33, 10]
};
