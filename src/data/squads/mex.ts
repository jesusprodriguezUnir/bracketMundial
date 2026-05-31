import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Raúl Rangel', position: 'GK', age: 26, club: 'Chivas' },
  { number: 12, name: 'Guillermo Ochoa', position: 'GK', age: 40, club: 'AEL Limassol' },
  { number: 13, name: 'Carlos Acevedo', position: 'GK', age: 30, club: 'Santos Laguna' },

  // Defensas
  { number: 2, name: 'Jorge Sánchez', position: 'DF', age: 28, club: 'PAOK' },
  { number: 3, name: 'César Montes', position: 'DF', age: 29, club: 'Lokomotiv Moscú', captain: true },
  { number: 5, name: 'Johan Vásquez', position: 'DF', age: 27, club: 'Genoa' },
  { number: 15, name: 'Israel Reyes', position: 'DF', age: 25, club: 'América' },
  { number: 23, name: 'Jesús Gallardo', position: 'DF', age: 31, club: 'Toluca' },
  { number: 22, name: 'Richard Ledezma', position: 'DF', age: 25, club: 'Chivas' },
  { number: 4, name: 'Jesús Angulo', position: 'DF', age: 28, club: 'Tigres' },
  { number: 18, name: 'Everardo López', position: 'DF', age: 21, club: 'Toluca' },

  // Mediocampistas
  { number: 6, name: 'Obed Vargas', position: 'MF', age: 20, club: 'Atlético de Madrid' },
  { number: 8, name: 'Álvaro Fidalgo', position: 'MF', age: 29, club: 'Real Betis' },
  { number: 14, name: 'Erik Lira', position: 'MF', age: 26, club: 'Cruz Azul' },
  { number: 16, name: 'Orbelín Pineda', position: 'MF', age: 30, club: 'AEK Atenas' },
  { number: 21, name: 'Brian Gutiérrez', position: 'MF', age: 23, club: 'Chivas' },
  { number: 24, name: 'Denzell García', position: 'MF', age: 22, club: 'FC Juárez' },
  { number: 25, name: 'Carlos Rodríguez', position: 'MF', age: 29, club: 'Cruz Azul' },
  { number: 7, name: 'Erick Sánchez', position: 'MF', age: 26, club: 'América' },
  { number: 19, name: 'Roberto Alvarado', position: 'MF', age: 27, club: 'Chivas' },

  // Delanteros
  { number: 9, name: 'Raúl Jiménez', position: 'FW', age: 35, club: 'Fulham' },
  { number: 10, name: 'Alexis Vega', position: 'FW', age: 28, club: 'Toluca' },
  { number: 11, name: 'Germán Berterame', position: 'FW', age: 27, club: 'Inter Miami' },
  { number: 17, name: 'Armando González', position: 'FW', age: 23, club: 'Chivas' },
  { number: 26, name: 'Guillermo Martínez', position: 'FW', age: 31, club: 'Pumas' },
  { number: 33, name: 'Julián Quiñones', position: 'FW', age: 29, club: 'Al-Qadsiah' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 22, 3, 5, 2, 6, 8, 16, 11, 33, 10],
};
