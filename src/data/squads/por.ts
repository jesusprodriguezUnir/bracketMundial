import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Diogo Costa', position: 'GK', age: 26, club: 'Porto' },
  { number: 12, name: 'José Sá', position: 'GK', age: 33, club: 'Wolves' },
  { number: 22, name: 'Rui Silva', position: 'GK', age: 31, club: 'Sporting' },
  // Defensores
  { number: 2, name: 'Nélson Semedo', position: 'DF', age: 32, club: 'Fenerbahce' },
  { number: 3, name: 'Rúben Dias', position: 'DF', age: 29, club: 'Manchester City', captain: true },
  { number: 4, name: 'Tomás Araújo', position: 'DF', age: 24, club: 'Benfica' },
  { number: 5, name: 'Diogo Dalot', position: 'DF', age: 27, club: 'Manchester United' },
  { number: 6, name: 'Matheus Nunes', position: 'DF', age: 27, club: 'Manchester City' },
  { number: 13, name: 'Renato Veiga', position: 'DF', age: 22, club: 'Villarreal' },
  { number: 14, name: 'Gonçalo Inácio', position: 'DF', age: 24, club: 'Sporting' },
  { number: 20, name: 'João Cancelo', position: 'DF', age: 32, club: 'Barcelona' },
  { number: 25, name: 'Nuno Mendes', position: 'DF', age: 24, club: 'Paris St-Germain' },
  // Volantes
  { number: 8, name: 'Bruno Fernandes', position: 'MF', age: 31, club: 'Manchester United' },
  { number: 10, name: 'Bernardo Silva', position: 'MF', age: 31, club: 'Manchester City' },
  { number: 15, name: 'João Neves', position: 'MF', age: 21, club: 'Paris St-Germain' },
  { number: 16, name: 'Francisco Trincão', position: 'MF', age: 23, club: 'Sporting' },
  { number: 21, name: 'Rúben Neves', position: 'MF', age: 29, club: 'Al-Hilal' },
  { number: 23, name: 'Vitinha', position: 'MF', age: 26, club: 'Paris St-Germain' },
  { number: 24, name: 'Samú Costa', position: 'MF', age: 25, club: 'Real Mallorca' },
  // Delanteros
  { number: 7, name: 'Cristiano Ronaldo', position: 'FW', age: 41, club: 'Al-Nassr' },
  { number: 9, name: 'Gonçalo Ramos', position: 'FW', age: 25, club: 'Paris St-Germain' },
  { number: 11, name: 'João Félix', position: 'FW', age: 26, club: 'Al-Nassr' },
  { number: 17, name: 'Rafael Leão', position: 'FW', age: 26, club: 'Milan' },
  { number: 18, name: 'Pedro Neto', position: 'FW', age: 25, club: 'Chelsea' },
  { number: 19, name: 'Gonçalo Guedes', position: 'FW', age: 29, club: 'Real Sociedad' },
  { number: 26, name: 'Francisco Conceição', position: 'FW', age: 23, club: 'Juventus' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 25, 3, 14, 20, 15, 23, 8, 10, 7, 17]
};
