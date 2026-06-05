import type { Player } from './index';

export const coach = 'Luis de la Fuente';
export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'David Raya', position: 'GK', age: 30, club: 'Arsenal' },
  { number: 13, name: 'Joan García', position: 'GK', age: 25, club: 'Barcelona' },
  { number: 23, name: 'Unai Simón', position: 'GK', age: 28, club: 'Athletic Club' },
  // Defensores
  { number: 2, name: 'Marc Pubill', position: 'DF', age: 22, club: 'Atlético Madrid' },
  { number: 3, name: 'Álex Grimaldo', position: 'DF', age: 31, club: 'Bayer Leverkusen' },
  { number: 4, name: 'Eric García', position: 'DF', age: 24, club: 'Barcelona' },
  { number: 5, name: 'Marcos Llorente', position: 'DF', age: 31, club: 'Atlético Madrid' },
  { number: 12, name: 'Pedro Porro', position: 'DF', age: 26, club: 'Tottenham' },
  { number: 14, name: 'Aymeric Laporte', position: 'DF', age: 32, club: 'Athletic Club' },
  { number: 22, name: 'Pau Cubarsí', position: 'DF', age: 19, club: 'Barcelona' },
  { number: 24, name: 'Marc Cucurella', position: 'DF', age: 28, club: 'Chelsea' },
  // Volantes
  { number: 6, name: 'Mikel Merino', position: 'MF', age: 30, club: 'Arsenal' },
  { number: 8, name: 'Fabián Ruiz', position: 'MF', age: 30, club: 'Paris St-Germain' },
  { number: 9, name: 'Gavi', position: 'MF', age: 22, club: 'Barcelona' },
  { number: 10, name: 'Dani Olmo', position: 'MF', age: 27, club: 'Barcelona' },
  { number: 15, name: 'Álex Baena', position: 'MF', age: 24, club: 'Atlético Madrid' },
  { number: 16, name: 'Rodri', position: 'MF', age: 23, club: 'Manchester City' },
  { number: 18, name: 'Martín Zubimendi', position: 'MF', age: 27, club: 'Arsenal' },
  { number: 20, name: 'Pedri', position: 'MF', age: 23, club: 'Barcelona' },
  // Delanteros
  { number: 7, name: 'Ferran Torres', position: 'FW', age: 26, club: 'Barcelona' },
  { number: 11, name: 'Yéremy Pino', position: 'FW', age: 24, club: 'Crystal Palace' },
  { number: 17, name: 'Nico Williams', position: 'FW', age: 23, club: 'Athletic Club' },
  { number: 19, name: 'Lamine Yamal', position: 'FW', age: 19, club: 'Barcelona' },
  { number: 21, name: 'Mikel Oyarzabal', position: 'FW', age: 29, club: 'Real Sociedad' },
  { number: 25, name: 'Víctor Muñoz', position: 'FW', age: 23, club: 'Osasuna' },
  { number: 26, name: 'Borja Iglesias', position: 'FW', age: 33, club: 'Celta Vigo' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [23, 3, 22, 14, 5, 8, 20, 17, 21, 19]
};
