import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Thibaut Courtois', position: 'GK', age: 33, club: 'Real Madrid' },
  { number: 12, name: 'Senne Lammens', position: 'GK', age: 23, club: 'Manchester United' },
  { number: 13, name: 'Mike Penders', position: 'GK', age: 20, club: 'Chelsea' },
  // Defensores
  { number: 2, name: 'Zeno Debast', position: 'DF', age: 22, club: 'Sporting' },
  { number: 3, name: 'Arthur Theate', position: 'DF', age: 26, club: 'Eintracht Frankfurt' },
  { number: 4, name: 'Brandon Mechele', position: 'DF', age: 33, club: 'Club Brugge' },
  { number: 5, name: 'Maxim De Cuyper', position: 'DF', age: 25, club: 'Brighton' },
  { number: 15, name: 'Thomas Meunier', position: 'DF', age: 34, club: 'Lille' },
  { number: 16, name: 'Koni De Winter', position: 'DF', age: 23, club: 'Milan' },
  { number: 18, name: 'Joaquin Seys', position: 'DF', age: 21, club: 'Club Brugge' },
  { number: 21, name: 'Timothy Castagne', position: 'DF', age: 31, club: 'Fulham' },
  { number: 25, name: 'Nathan Ngoy', position: 'DF', age: 22, club: 'Lille' },
  // Volantes
  { number: 6, name: 'Axel Witsel', position: 'MF', age: 36, club: 'Girona' },
  { number: 7, name: 'Kevin De Bruyne', position: 'MF', age: 34, club: 'Napoli', captain: true },
  { number: 8, name: 'Youri Tielemans', position: 'MF', age: 28, club: 'Aston Villa' },
  { number: 20, name: 'Hans Vanaken', position: 'MF', age: 33, club: 'Club Brugge' },
  { number: 23, name: 'Nicolas Raskin', position: 'MF', age: 25, club: 'Rangers' },
  { number: 24, name: 'Amadou Onana', position: 'MF', age: 24, club: 'Aston Villa' },
  // Delanteros
  { number: 9, name: 'Romelu Lukaku', position: 'FW', age: 33, club: 'Napoli' },
  { number: 10, name: 'Leandro Trossard', position: 'FW', age: 32, club: 'Arsenal' },
  { number: 11, name: 'Jérémy Doku', position: 'FW', age: 24, club: 'Manchester City' },
  { number: 14, name: 'Dodi Lukébakio', position: 'FW', age: 28, club: 'Benfica' },
  { number: 17, name: 'Charles De Ketelaere', position: 'FW', age: 24, club: 'Atalanta' },
  { number: 19, name: 'Diego Moreira', position: 'FW', age: 22, club: 'Strasbourg' },
  { number: 22, name: 'Alexis Saelemaekers', position: 'FW', age: 26, club: 'Milan' },
  { number: 26, name: 'Matias Fernandez-Pardo', position: 'FW', age: 21, club: 'Lille' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 15, 4, 3, 21, 7, 24, 8, 10, 9, 11]
};
