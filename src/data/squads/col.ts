import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 20, name: 'Camilo Vargas', position: 'GK', age: 37, club: 'Atlas' },
  { number: 12, name: 'Álvaro Montero', position: 'GK', age: 31, club: 'Vélez' },
  { number: 1, name: 'David Ospina', position: 'GK', age: 37, club: 'Nacional' },
  
  // Defensas
  { number: 4, name: 'Davinson Sánchez', position: 'DF', age: 29, club: 'Galatasaray' },
  { number: 26, name: 'Yerry Mina', position: 'DF', age: 31, club: 'Cagliari' },
  { number: 5, name: 'Willer Ditta', position: 'DF', age: 29, club: 'Cruz Azul' },
  { number: 3, name: 'Jhon Janer Lucumí', position: 'DF', age: 27, club: 'Bologna' },
  { number: 2, name: 'Daniel Muñoz', position: 'DF', age: 30, club: 'Crystal Palace' },
  { number: 13, name: 'Santiago Arias', position: 'DF', age: 34, club: 'Independiente' },
  { number: 17, name: 'Johan Mojica', position: 'DF', age: 33, club: 'Mallorca' },
  { number: 14, name: 'Deiver Machado', position: 'DF', age: 32, club: 'Nantes' },
  
  // Centrocampistas
  { number: 25, name: 'Richard Ríos', position: 'MF', age: 25, club: 'Benfica' },
  { number: 6, name: 'Jefferson Lerma', position: 'MF', age: 31, club: 'Crystal Palace' },
  { number: 15, name: 'Kevin Castaño', position: 'MF', age: 25, club: 'River Plate' },
  { number: 18, name: 'Juan Camilo Portilla', position: 'MF', age: 27, club: 'Paranaense' },
  { number: 19, name: 'Gustavo Puerta', position: 'MF', age: 22, club: 'Racing' },
  { number: 16, name: 'Jhon Arias', position: 'MF', age: 28, club: 'Palmeiras' },
  { number: 8, name: 'Jorge Carrascal', position: 'MF', age: 28, club: 'Flamengo' },
  { number: 21, name: 'Juan Fernando Quintero', position: 'MF', age: 33, club: 'River Plate' },
  { number: 10, name: 'James Rodríguez', position: 'MF', age: 34, club: 'Minnesota', captain: true },
  { number: 22, name: 'Jaminton Campaz', position: 'MF', age: 26, club: 'Rosario Central' },
  
  // Delanteros
  { number: 24, name: 'Juan Camilo Hernández', position: 'FW', age: 27, club: 'Betis' },
  { number: 23, name: 'Luis Díaz', position: 'FW', age: 29, club: 'Bayern' },
  { number: 9, name: 'Luis Javier Suárez', position: 'FW', age: 28, club: 'Sporting' },
  { number: 7, name: 'Carlos Andrés Gómez', position: 'FW', age: 23, club: 'Vasco' },
  { number: 11, name: 'Jhon Córdoba', position: 'FW', age: 33, club: 'Krasnodar' }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [20, 2, 26, 4, 17, 25, 6, 10, 16, 24, 23]
};