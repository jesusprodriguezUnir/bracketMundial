import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'David Ospina', position: 'GK', age: 37, club: 'Atlético Nacional' },
  { number: 12, name: 'Camilo Vargas', position: 'GK', age: 36, club: 'Atlas' },
  { number: 24, name: 'Álvaro Montero', position: 'GK', age: 31, club: 'Vélez Sarsfield' },
  // Defensores
  { number: 2, name: 'Daniel Muñoz', position: 'DF', age: 30, club: 'Crystal Palace' },
  { number: 3, name: 'Jhon Lucumí', position: 'DF', age: 27, club: 'Bologna' },
  { number: 4, name: 'Santiago Arias', position: 'DF', age: 34, club: 'Independiente' },
  { number: 13, name: 'Yerry Mina', position: 'DF', age: 31, club: 'Cagliari' },
  { number: 17, name: 'Johan Mojica', position: 'DF', age: 33, club: 'Mallorca' },
  { number: 18, name: 'Willer Ditta', position: 'DF', age: 29, club: 'Cruz Azul' },
  { number: 22, name: 'Deiver Machado', position: 'DF', age: 33, club: 'Nantes' },
  { number: 23, name: 'Davinson Sánchez', position: 'DF', age: 29, club: 'Galatasaray' },
  // Volantes
  { number: 5, name: 'Kevin Castaño', position: 'MF', age: 25, club: 'River Plate' },
  { number: 6, name: 'Richard Ríos', position: 'MF', age: 26, club: 'Benfica' },
  { number: 8, name: 'Jorge Carrascal', position: 'MF', age: 28, club: 'Flamengo' },
  { number: 10, name: 'James Rodríguez', position: 'MF', age: 34, club: 'Minnesota United', captain: true },
  { number: 11, name: 'Jhon Arias', position: 'MF', age: 28, club: 'Palmeiras' },
  { number: 14, name: 'Gustavo Puerta', position: 'MF', age: 22, club: 'Racing Santander' },
  { number: 15, name: 'Juan Portilla', position: 'MF', age: 27, club: 'Athletico Paranaense' },
  { number: 16, name: 'Jefferson Lerma', position: 'MF', age: 31, club: 'Crystal Palace' },
  { number: 20, name: 'Juan Quintero', position: 'MF', age: 0, club: 'River Plate' },
  // Delanteros
  { number: 7, name: 'Luis Díaz', position: 'FW', age: 29, club: 'Bayern Munich' },
  { number: 9, name: 'Jhon Córdoba', position: 'FW', age: 32, club: 'Krasnodar' },
  { number: 19, name: 'Juan Camilo ‘Cucho’ Hernández', position: 'FW', age: 27, club: 'Real Betis' },
  { number: 21, name: 'Jaminton Campaz', position: 'FW', age: 26, club: 'Rosario Central' },
  { number: 25, name: 'Luis Suárez', position: 'FW', age: 29, club: 'Sporting' },
  { number: 26, name: 'Carlos Andrés Gómez', position: 'FW', age: 23, club: 'Vasco da Gama' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [12, 2, 13, 23, 17, 6, 16, 10, 11, 19, 7]
};
