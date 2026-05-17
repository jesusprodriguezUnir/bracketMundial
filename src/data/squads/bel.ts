import type { Player } from './index';

export const squad: Player[] = [
  { number: 1, name: 'Thibaut Courtois', position: 'GK', age: 34, club: 'Real Madrid', captain: true },
  { number: 2, name: 'Senne Lammens', position: 'GK', age: 24, club: 'Manchester United' },
  { number: 3, name: 'Mike Penders', position: 'GK', age: 20, club: 'Strasbourg' },
  { number: 26, name: 'Matz Sels', position: 'GK', age: 33, club: 'Nottingham Forest' },
  { number: 4, name: 'Timothy Castagne', position: 'DF', age: 30, club: 'Fulham' },
  { number: 5, name: 'Zeno Debast', position: 'DF', age: 22, club: 'Sporting CP' },
  { number: 6, name: 'Maxim De Cuyper', position: 'DF', age: 25, club: 'Brighton & Hove Albion' },
  { number: 7, name: 'Koni De Winter', position: 'DF', age: 23, club: 'AC Milan' },
  { number: 8, name: 'Brandon Mechele', position: 'DF', age: 33, club: 'Club Brugge' },
  { number: 9, name: 'Thomas Meunier', position: 'DF', age: 34, club: 'Lille' },
  { number: 10, name: 'Nathan Ngoy', position: 'DF', age: 22, club: 'Lille' },
  { number: 11, name: 'Joaquín Seys', position: 'DF', age: 21, club: 'Club Brugge' },
  { number: 12, name: 'Arthur Theate', position: 'DF', age: 26, club: 'Eintracht Frankfurt' },
  { number: 13, name: 'Kevin De Bruyne', position: 'MF', age: 34, club: 'Napoli' },
  { number: 14, name: 'Amadou Onana', position: 'MF', age: 24, club: 'Aston Villa' },
  { number: 15, name: 'Nicolás Raskin', position: 'MF', age: 25, club: 'Rangers' },
  { number: 16, name: 'Youri Tielemans', position: 'MF', age: 29, club: 'Aston Villa' },
  { number: 17, name: 'Hans Vanaken', position: 'MF', age: 33, club: 'Club Brugge' },
  { number: 18, name: 'Axel Witsel', position: 'MF', age: 37, club: 'Girona' },
  { number: 27, name: 'Nathan De Cat', position: 'MF', age: 21, club: 'Antwerp' },
  { number: 19, name: 'Charles De Ketelaere', position: 'FW', age: 25, club: 'Atalanta' },
  { number: 20, name: 'Jérémy Doku', position: 'FW', age: 24, club: 'Manchester City' },
  { number: 21, name: 'Matias Fernandez Pardo', position: 'FW', age: 21, club: 'Lille' },
  { number: 22, name: 'Romelu Lukaku', position: 'FW', age: 33, club: 'Napoli' },
  { number: 23, name: 'Dodi Lukébakio', position: 'FW', age: 28, club: 'Benfica' },
  { number: 24, name: 'Diego Moreira', position: 'FW', age: 21, club: 'Strasbourg' },
  { number: 25, name: 'Alexis Saelemaekers', position: 'FW', age: 26, club: 'AC Milan' },
  { number: 28, name: 'Leandro Trossard', position: 'FW', age: 31, club: 'Arsenal' },
  { number: 29, name: 'Lois Openda', position: 'FW', age: 26, club: 'RB Leipzig' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 4, 5, 7, 12, 14, 16, 13, 20, 22, 28]
};
