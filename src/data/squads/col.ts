import type { Player } from './index';

export const squad: Player[] = [
  { number: 1, name: 'David Ospina', position: 'GK', age: 37, club: 'Al-Nassr' },
  { number: 12, name: 'José Luis Chunga', position: 'GK', age: 34, club: 'Alianza Petrolera' },
  { number: 2, name: 'Daniel Muñoz', position: 'DF', age: 30, club: 'Genk' },
  { number: 3, name: 'Jhon Lucumí', position: 'DF', age: 27, club: 'Bologna' },
  { number: 4, name: 'Davinson Sánchez', position: 'DF', age: 30, club: 'Tottenham Hotspur' },
  { number: 5, name: 'Carlos Cuesta', position: 'DF', age: 27, club: 'Genk' },
  { number: 13, name: 'Wílmar Barrios', position: 'MF', age: 32, club: 'Zenit' },
  { number: 18, name: 'Frank Fabra', position: 'DF', age: 35, club: 'Boca Juniors' },
  { number: 17, name: 'Johan Mojica', position: 'DF', age: 33, club: 'Villarreal' },
  { number: 6, name: 'Jefferson Lerma', position: 'MF', age: 31, club: 'Bournemouth' },
  { number: 10, name: 'James Rodríguez', position: 'MF', age: 34, club: 'Olympiacos', captain: true },
  { number: 16, name: 'Jhon Arias', position: 'MF', age: 28, club: 'Fluminense' },
  { number: 8, name: 'Jorge Carrascal', position: 'MF', age: 28, club: 'CSKA Moscú' },
  { number: 21, name: 'Juan Fernando Quintero', position: 'MF', age: 33, club: 'River Plate' },
  { number: 14, name: 'Sebastián Gómez', position: 'MF', age: 29, club: 'Atlético Nacional' },
  { number: 15, name: 'Eduard Atuesta', position: 'MF', age: 28, club: 'Palmeiras' },
  { number: 7, name: 'Diego Valoyes', position: 'FW', age: 29, club: 'Talleres' },
  { number: 9, name: 'Falcao García', position: 'FW', age: 40, club: 'Rayo Vallecano' },
  { number: 11, name: 'Jhon Jáder Durán', position: 'FW', age: 22, club: 'Chicago Fire' },
  { number: 19, name: 'Rafael Santos Borré', position: 'FW', age: 30, club: 'Eintracht Frankfurt' },
  { number: 22, name: 'Santiago Moreno', position: 'FW', age: 26, club: 'Portland Timbers' },
  { number: 23, name: 'Luis Díaz', position: 'FW', age: 29, club: 'Liverpool' },
  { number: 24, name: 'Cucho Hernández', position: 'FW', age: 27, club: 'Columbus Crew' },
  { number: 25, name: 'Richard Ríos', position: 'MF', age: 25, club: 'Palmeiras' },
  { number: 26, name: 'Yerry Mina', position: 'DF', age: 31, club: 'Cagliari' },
  { number: 20, name: 'Camilo Vargas', position: 'GK', age: 37, club: 'Atlas' }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 4, 17, 6, 13, 10, 16, 19, 9]
};