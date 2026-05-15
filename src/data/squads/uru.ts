import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Sergio Rochet', position: 'GK', age: 33, club: 'Internacional' },
  { number: 12, name: 'Santiago Mele', position: 'GK', age: 29, club: 'Junior' },
  { number: 23, name: 'Franco Israel', position: 'GK', age: 26, club: 'Sporting CP' },
  { number: 2, name: 'José María Giménez', position: 'DF', age: 31, club: 'Atlético de Madrid', captain: true },
  { number: 3, name: 'Matías Viña', position: 'DF', age: 29, club: 'Flamengo' },
  { number: 4, name: 'Ronald Araújo', position: 'DF', age: 27, club: 'Barcelona' },
  { number: 13, name: 'Guillermo Varela', position: 'DF', age: 33, club: 'Flamengo' },
  { number: 14, name: 'Marcelo Saracchi', position: 'DF', age: 28, club: 'Boca Juniors' },
  { number: 16, name: 'Sebastián Cáceres', position: 'DF', age: 27, club: 'América' },
  { number: 22, name: 'Mathías Olivera', position: 'DF', age: 28, club: 'Napoli' },
  { number: 5, name: 'Manuel Ugarte', position: 'MF', age: 25, club: 'Manchester United' },
  { number: 6, name: 'Rodrigo Bentancur', position: 'MF', age: 29, club: 'Tottenham Hotspur' },
  { number: 8, name: 'Federico Valverde', position: 'MF', age: 28, club: 'Real Madrid' },
  { number: 10, name: 'Nicolás de la Cruz', position: 'MF', age: 29, club: 'Flamengo' },
  { number: 15, name: 'Giorgian de Arrascaeta', position: 'MF', age: 32, club: 'Flamengo' },
  { number: 17, name: 'Facundo Pellistri', position: 'MF', age: 24, club: 'Panathinaikos' },
  { number: 7, name: 'Maximiliano Araújo', position: 'FW', age: 26, club: 'Toluca' },
  { number: 9, name: 'Darwin Núñez', position: 'FW', age: 27, club: 'Liverpool' },
  { number: 11, name: 'Brian Rodríguez', position: 'FW', age: 26, club: 'América' },
  { number: 18, name: 'Agustín Canobbio', position: 'FW', age: 28, club: 'Athletico Paranaense' },
  { number: 19, name: 'Cristian Olivera', position: 'FW', age: 24, club: 'Los Angeles FC' },
  { number: 20, name: 'Facundo Torres', position: 'FW', age: 26, club: 'Orlando City' },
  { number: 21, name: 'Luciano Rodríguez', position: 'FW', age: 22, club: 'Bahia' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 4, 2, 22, 5, 8, 6, 18, 9, 7]
};