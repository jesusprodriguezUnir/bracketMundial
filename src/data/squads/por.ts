import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Diogo Costa', position: 'GK', age: 26, club: 'Porto' },
  { number: 12, name: 'José Sá', position: 'GK', age: 33, club: 'Wolverhampton' },
  { number: 22, name: 'Rui Silva', position: 'GK', age: 32, club: 'Real Betis' },
  { number: 27, name: 'Ricardo Velho', position: 'GK', age: 27, club: 'Farense' },

  { number: 2, name: 'Diogo Dalot', position: 'DF', age: 27, club: 'Manchester United' },
  { number: 3, name: 'Nuno Mendes', position: 'DF', age: 24, club: 'Paris Saint-Germain' },
  { number: 4, name: 'Rúben Dias', position: 'DF', age: 29, club: 'Manchester City', captain: true },
  { number: 5, name: 'Gonçalo Inácio', position: 'DF', age: 24, club: 'Sporting CP' },
  { number: 6, name: 'Nélson Semedo', position: 'DF', age: 32, club: 'Wolverhampton' },
  { number: 13, name: 'Renato Veiga', position: 'DF', age: 22, club: 'Chelsea' },
  { number: 14, name: 'Tomás Araújo', position: 'DF', age: 24, club: 'Benfica' },
  { number: 15, name: 'João Cancelo', position: 'DF', age: 32, club: 'Al Hilal' },
  { number: 23, name: 'Matheus Nunes', position: 'DF', age: 27, club: 'Manchester City' },

  { number: 7, name: 'Rúben Neves', position: 'MF', age: 29, club: 'Al Hilal' },
  { number: 8, name: 'Bruno Fernandes', position: 'MF', age: 31, club: 'Manchester United' },
  { number: 10, name: 'Bernardo Silva', position: 'MF', age: 31, club: 'Manchester City' },
  { number: 16, name: 'Vitinha', position: 'MF', age: 26, club: 'Paris Saint-Germain' },
  { number: 18, name: 'João Neves', position: 'MF', age: 21, club: 'Paris Saint-Germain' },
  { number: 21, name: 'Samuel Costa', position: 'MF', age: 25, club: 'Mallorca' },

  { number: 9, name: 'Rafael Leão', position: 'FW', age: 27, club: 'Milan' },
  { number: 11, name: 'Gonçalo Ramos', position: 'FW', age: 25, club: 'Paris Saint-Germain' },
  { number: 17, name: 'Pedro Neto', position: 'FW', age: 26, club: 'Chelsea' },
  { number: 19, name: 'João Félix', position: 'FW', age: 27, club: 'Barcelona' },
  { number: 20, name: 'Cristiano Ronaldo', position: 'FW', age: 41, club: 'Al Nassr' },
  { number: 24, name: 'Francisco Conceição', position: 'FW', age: 23, club: 'Juventus' },
  { number: 25, name: 'Trincão', position: 'FW', age: 26, club: 'Sporting CP' },
  { number: 26, name: 'Gonzalo Guedes', position: 'FW', age: 29, club: 'Wolverhampton' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 4, 5, 15, 18, 16, 8, 10, 20, 9]
};