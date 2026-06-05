import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Sergio Rochet', position: 'GK', age: 33, club: 'Internacional' },
  { number: 12, name: 'Santiago Mele', position: 'GK', age: 29, club: 'Monterrey' },
  { number: 23, name: 'Fernando Muslera', position: 'GK', age: 39, club: 'Estudiantes de La Plata' },
  // Defensores
  { number: 2, name: 'José María Giménez', position: 'DF', age: 31, club: 'Atlético Madrid', captain: true },
  { number: 3, name: 'Sebastián Cáceres', position: 'DF', age: 27, club: 'Club América' },
  { number: 4, name: 'Ronald Araújo', position: 'DF', age: 26, club: 'Barcelona' },
  { number: 13, name: 'Guillermo Varela', position: 'DF', age: 33, club: 'Flamengo' },
  { number: 16, name: 'Mathías Olivera', position: 'DF', age: 28, club: 'Napoli' },
  { number: 17, name: 'Matías Viña', position: 'DF', age: 28, club: 'River Plate' },
  { number: 22, name: 'Joaquín Piquerez', position: 'DF', age: 27, club: 'Palmeiras' },
  { number: 24, name: 'Santiago Bueno', position: 'DF', age: 27, club: 'Wolves' },
  { number: 25, name: 'Juan Manuel Sanabria', position: 'DF', age: 26, club: 'Real Salt Lake' },
  // Volantes
  { number: 5, name: 'Manuel Ugarte', position: 'MF', age: 24, club: 'Manchester United' },
  { number: 6, name: 'Rodrigo Bentancur', position: 'MF', age: 29, club: 'Tottenham' },
  { number: 7, name: 'Nicolás de la Cruz', position: 'MF', age: 29, club: 'Flamengo' },
  { number: 8, name: 'Federico Valverde', position: 'MF', age: 28, club: 'Real Madrid' },
  { number: 10, name: 'Giorgian de Arrascaeta', position: 'MF', age: 32, club: 'Flamengo' },
  { number: 14, name: 'Agustín Canobbio', position: 'MF', age: 28, club: 'Fluminense' },
  { number: 15, name: 'Emiliano Martínez', position: 'MF', age: 26, club: 'Palmeiras' },
  { number: 26, name: 'Rodrigo Zalazar', position: 'MF', age: 26, club: 'Braga' },
  // Delanteros
  { number: 9, name: 'Darwin Núñez', position: 'FW', age: 27, club: 'Al-Hilal' },
  { number: 11, name: 'Facundo Pellistri', position: 'FW', age: 24, club: 'Panathinaikos' },
  { number: 18, name: 'Brian Rodríguez', position: 'FW', age: 26, club: 'Club América' },
  { number: 19, name: 'Rodrigo Aguirre', position: 'FW', age: 32, club: 'Tigres' },
  { number: 20, name: 'Maximiliano Araújo', position: 'FW', age: 26, club: 'Sporting' },
  { number: 21, name: 'Federico Viñas', position: 'FW', age: 27, club: 'León' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 4, 2, 16, 5, 8, 6, 14, 9, 20]
};
