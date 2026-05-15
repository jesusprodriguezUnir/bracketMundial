import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Diogo Costa', position: 'GK', age: 27, club: 'Porto' },
  { number: 12, name: 'José Sá', position: 'GK', age: 33, club: 'Wolverhampton' },
  { number: 23, name: 'Rui Patrício', position: 'GK', age: 38, club: 'Atalanta' },
  { number: 2, name: 'Diogo Dalot', position: 'DF', age: 27, club: 'Manchester United' },
  { number: 3, name: 'Nuno Mendes', position: 'DF', age: 24, club: 'Paris Saint-Germain' },
  { number: 4, name: 'Rúben Dias', position: 'DF', age: 29, club: 'Manchester City', captain: true },
  { number: 5, name: 'Gonçalo Inácio', position: 'DF', age: 25, club: 'Sporting CP' },
  { number: 13, name: 'Pepe', position: 'DF', age: 43, club: 'Porto' },
  { number: 14, name: 'António Silva', position: 'DF', age: 22, club: 'Benfica' },
  { number: 22, name: 'João Cancelo', position: 'DF', age: 32, club: 'Al Hilal' },
  { number: 6, name: 'João Palhinha', position: 'MF', age: 31, club: 'Bayern Munich' },
  { number: 8, name: 'Bruno Fernandes', position: 'MF', age: 32, club: 'Manchester United' },
  { number: 10, name: 'Bernardo Silva', position: 'MF', age: 32, club: 'Manchester City' },
  { number: 15, name: 'Vitinha', position: 'MF', age: 26, club: 'Paris Saint-Germain' },
  { number: 16, name: 'Matheus Nunes', position: 'MF', age: 28, club: 'Manchester City' },
  { number: 18, name: 'João Neves', position: 'MF', age: 21, club: 'Paris Saint-Germain' },
  { number: 7, name: 'Rafael Leão', position: 'FW', age: 27, club: 'Milan' },
  { number: 9, name: 'Gonçalo Ramos', position: 'FW', age: 25, club: 'Paris Saint-Germain' },
  { number: 11, name: 'Pedro Neto', position: 'FW', age: 26, club: 'Chelsea' },
  { number: 17, name: 'Francisco Conceição', position: 'FW', age: 23, club: 'Juventus' },
  { number: 19, name: 'João Félix', position: 'FW', age: 27, club: 'Barcelona' },
  { number: 20, name: 'Cristiano Ronaldo', position: 'FW', age: 41, club: 'Al Nassr' },
  { number: 21, name: 'Diogo Jota', position: 'FW', age: 30, club: 'Liverpool' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 4, 5, 3, 6, 8, 10, 7, 20, 21]
};