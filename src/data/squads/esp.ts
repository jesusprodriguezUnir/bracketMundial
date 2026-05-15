import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Unai Simón', position: 'GK', age: 29, club: 'Athletic Club' },
  { number: 13, name: 'David Raya', position: 'GK', age: 30, club: 'Arsenal' },
  { number: 23, name: 'Álex Remiro', position: 'GK', age: 31, club: 'Real Sociedad' },
  { number: 2, name: 'Dani Carvajal', position: 'DF', age: 34, club: 'Real Madrid', captain: true },
  { number: 3, name: 'Alejandro Grimaldo', position: 'DF', age: 31, club: 'Bayer Leverkusen' },
  { number: 4, name: 'Pau Cubarsí', position: 'DF', age: 19, club: 'Barcelona' },
  { number: 5, name: 'Robin Le Normand', position: 'DF', age: 30, club: 'Atlético de Madrid' },
  { number: 12, name: 'Aleix García', position: 'DF', age: 29, club: 'Bayer Leverkusen' },
  { number: 14, name: 'Aymeric Laporte', position: 'DF', age: 32, club: 'Al Nassr' },
  { number: 22, name: 'Marc Cucurella', position: 'DF', age: 28, club: 'Chelsea' },
  { number: 6, name: 'Rodri', position: 'MF', age: 30, club: 'Manchester City' },
  { number: 8, name: 'Pedri', position: 'MF', age: 23, club: 'Barcelona' },
  { number: 10, name: 'Dani Olmo', position: 'MF', age: 28, club: 'Barcelona' },
  { number: 15, name: 'Fabián Ruiz', position: 'MF', age: 30, club: 'Paris Saint-Germain' },
  { number: 16, name: 'Mikel Merino', position: 'MF', age: 30, club: 'Arsenal' },
  { number: 18, name: 'Gavi', position: 'MF', age: 22, club: 'Barcelona' },
  { number: 7, name: 'Lamine Yamal', position: 'FW', age: 19, club: 'Barcelona' },
  { number: 9, name: 'Álvaro Morata', position: 'FW', age: 34, club: 'Galatasaray' },
  { number: 11, name: 'Nico Williams', position: 'FW', age: 24, club: 'Athletic Club' },
  { number: 17, name: 'Yeremy Pino', position: 'FW', age: 24, club: 'Villarreal' },
  { number: 19, name: 'Ferran Torres', position: 'FW', age: 26, club: 'Barcelona' },
  { number: 20, name: 'Mikel Oyarzabal', position: 'FW', age: 29, club: 'Real Sociedad' },
  { number: 21, name: 'Ayoze Pérez', position: 'FW', age: 32, club: 'Villarreal' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 14, 3, 6, 8, 15, 7, 9, 11]
};