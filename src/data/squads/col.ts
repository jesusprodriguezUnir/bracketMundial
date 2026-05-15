import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Camilo Vargas', position: 'GK', age: 37, club: 'Atlas' },
  { number: 12, name: 'Álvaro Montero', position: 'GK', age: 31, club: 'Millonarios' },
  { number: 23, name: 'Kevin Mier', position: 'GK', age: 26, club: 'Cruz Azul' },
  { number: 2, name: 'Daniel Muñoz', position: 'DF', age: 30, club: 'Crystal Palace' },
  { number: 3, name: 'Jhon Lucumí', position: 'DF', age: 28, club: 'Bologna' },
  { number: 4, name: 'Davinson Sánchez', position: 'DF', age: 30, club: 'Galatasaray' },
  { number: 5, name: 'Carlos Cuesta', position: 'DF', age: 27, club: 'Genk' },
  { number: 13, name: 'Yerry Mina', position: 'DF', age: 32, club: 'Cagliari' },
  { number: 14, name: 'Deiver Machado', position: 'DF', age: 32, club: 'Lens' },
  { number: 15, name: 'Cristian Borja', position: 'DF', age: 33, club: 'Club América' },
  { number: 6, name: 'Jefferson Lerma', position: 'MF', age: 32, club: 'Crystal Palace' },
  { number: 8, name: 'Richard Ríos', position: 'MF', age: 26, club: 'Palmeiras' },
  { number: 10, name: 'James Rodríguez', position: 'MF', age: 35, club: 'León', captain: true },
  { number: 16, name: 'Jhon Arias', position: 'MF', age: 29, club: 'Fluminense' },
  { number: 17, name: 'Jorge Carrascal', position: 'MF', age: 28, club: 'Dinamo Moscú' },
  { number: 18, name: 'Kevin Castaño', position: 'MF', age: 26, club: 'Krasnodar' },
  { number: 7, name: 'Luis Díaz', position: 'FW', age: 29, club: 'Liverpool' },
  { number: 9, name: 'Rafael Santos Borré', position: 'FW', age: 31, club: 'Internacional' },
  { number: 11, name: 'Jhon Córdoba', position: 'FW', age: 33, club: 'Krasnodar' },
  { number: 19, name: 'Luis Sinisterra', position: 'FW', age: 27, club: 'Bournemouth' },
  { number: 20, name: 'Yáser Asprilla', position: 'FW', age: 22, club: 'Girona' },
  { number: 21, name: 'Juan Fernando Quintero', position: 'FW', age: 33, club: 'Racing Club' },
  { number: 22, name: 'Marino Hinestroza', position: 'FW', age: 23, club: 'Atlético Nacional' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 15, 6, 8, 10, 16, 11, 7]
};