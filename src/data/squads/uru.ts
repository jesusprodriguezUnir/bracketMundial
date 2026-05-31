import type { Player } from './index';

export const squad: Player[] = [
  { number: 1, name: 'Sergio Rochet', position: 'GK', age: 33, club: 'Internacional' },
  { number: 12, name: 'Santiago Mele', position: 'GK', age: 29, club: 'Monterrey' },
  { number: 23, name: 'Fernando Muslera', position: 'GK', age: 39, club: 'Estudiantes de La Plata' },
  { number: 2, name: 'José María Giménez', position: 'DF', age: 31, club: 'Atlético de Madrid', captain: true },
  { number: 3, name: 'Matías Viña', position: 'DF', age: 29, club: 'River Plate' },
  { number: 4, name: 'Ronald Araújo', position: 'DF', age: 27, club: 'FC Barcelona' },
  { number: 13, name: 'Guillermo Varela', position: 'DF', age: 33, club: 'Flamengo' },
  { number: 16, name: 'Sebastián Cáceres', position: 'DF', age: 27, club: 'América' },
  { number: 22, name: 'Mathías Olivera', position: 'DF', age: 28, club: 'Napoli' },
  { number: 24, name: 'Santiago Bueno', position: 'DF', age: 27, club: 'Wolverhampton' },
  { number: 14, name: 'Joaquín Piquerez', position: 'DF', age: 27, club: 'Palmeiras' },
  { number: 26, name: 'Juan Manuel Sanabria', position: 'DF', age: 26, club: 'Real Salt Lake' },
  { number: 8, name: 'Federico Valverde', position: 'MF', age: 28, club: 'Real Madrid' },
  { number: 5, name: 'Manuel Ugarte', position: 'MF', age: 25, club: 'Manchester United' },
  { number: 6, name: 'Rodrigo Bentancur', position: 'MF', age: 29, club: 'Tottenham Hotspur' },
  { number: 10, name: 'Nicolás de la Cruz', position: 'MF', age: 29, club: 'Flamengo' },
  { number: 15, name: 'Giorgian De Arrascaeta', position: 'MF', age: 32, club: 'Flamengo' },
  { number: 19, name: 'Emiliano Martínez', position: 'MF', age: 26, club: 'Palmeiras' },
  { number: 21, name: 'Rodrigo Zalazar', position: 'MF', age: 26, club: 'SC Braga' },
  { number: 9, name: 'Darwin Núñez', position: 'FW', age: 27, club: 'Al-Hilal' },
  { number: 17, name: 'Facundo Pellistri', position: 'FW', age: 24, club: 'Panathinaikos' },
  { number: 7, name: 'Maximiliano Araújo', position: 'FW', age: 26, club: 'Sporting CP' },
  { number: 11, name: 'Brian Rodríguez', position: 'FW', age: 26, club: 'América' },
  { number: 27, name: 'Rodrigo Aguirre', position: 'FW', age: 31, club: 'Tigres UANL' },
  { number: 28, name: 'Federico Viñas', position: 'FW', age: 27, club: 'Real Oviedo' },
  { number: 18, name: 'Agustín Canobbio', position: 'FW', age: 28, club: 'Fluminense' }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 4, 2, 22, 5, 8, 6, 18, 9, 7]
};