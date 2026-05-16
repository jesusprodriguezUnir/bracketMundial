import type { Player } from './index';

export const coach = 'Luis de la Fuente';
export const squad: Player[] = [
  { number: 1, name: 'Unai Simón', position: 'GK', age: 29, club: 'Athletic Club' },
  { number: 13, name: 'David Raya', position: 'GK', age: 30, club: 'Arsenal' },
  { number: 23, name: 'Álex Remiro', position: 'GK', age: 31, club: 'Real Sociedad' },
  { number: 2, name: 'Pedro Porro', position: 'DF', age: 26, club: 'Tottenham' },
  { number: 12, name: 'Marcos Llorente', position: 'DF', age: 31, club: 'Atlético de Madrid' },
  { number: 14, name: 'Aymeric Laporte', position: 'DF', age: 32, club: 'Athletic Club' },
  { number: 5, name: 'Robin Le Normand', position: 'DF', age: 30, club: 'Atlético de Madrid' },
  { number: 4, name: 'Pau Cubarsí', position: 'DF', age: 19, club: 'FC Barcelona' },
  { number: 24, name: 'Dani Vivian', position: 'DF', age: 26, club: 'Athletic Club' },
  { number: 22, name: 'Marc Cucurella', position: 'DF', age: 28, club: 'Chelsea' },
  { number: 3, name: 'Alejandro Grimaldo', position: 'DF', age: 31, club: 'Bayer Leverkusen' },
  { number: 16, name: 'Rodri Hernández', position: 'MF', age: 30, club: 'Manchester City', captain: true },
  { number: 6, name: 'Martín Zubimendi', position: 'MF', age: 27, club: 'Arsenal' },
  { number: 15, name: 'Fabián Ruiz', position: 'MF', age: 30, club: 'PSG' },
  { number: 8, name: 'Pedri', position: 'MF', age: 23, club: 'FC Barcelona' },
  { number: 10, name: 'Dani Olmo', position: 'MF', age: 28, club: 'FC Barcelona' },
  { number: 25, name: 'Mikel Merino', position: 'MF', age: 30, club: 'Arsenal' },
  { number: 18, name: 'Gavi', position: 'MF', age: 22, club: 'FC Barcelona' },
  { number: 26, name: 'Fermín López', position: 'MF', age: 23, club: 'FC Barcelona' },
  { number: 7, name: 'Lamine Yamal', position: 'FW', age: 19, club: 'FC Barcelona' },
  { number: 11, name: 'Nico Williams', position: 'FW', age: 24, club: 'Athletic Club' },
  { number: 9, name: 'Mikel Oyarzabal', position: 'FW', age: 29, club: 'Real Sociedad' },
  { number: 19, name: 'Ferran Torres', position: 'FW', age: 26, club: 'FC Barcelona' },
  { number: 20, name: 'Álex Baena', position: 'FW', age: 24, club: 'Atlético de Madrid' },
  { number: 17, name: 'Yéremy Pino', position: 'FW', age: 24, club: 'Crystal Palace' },
  { number: 21, name: 'Ayoze Pérez', position: 'FW', age: 32, club: 'Villarreal' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 14, 22, 16, 15, 8, 7, 9, 11]
};