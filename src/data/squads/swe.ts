import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Jacob Widell Zetterström', position: 'GK', age: 27, club: 'Derby County' },
  { number: 12, name: 'Viktor Johansson', position: 'GK', age: 27, club: 'Stoke City' },
  { number: 23, name: 'Kristoffer Nordfeldt', position: 'GK', age: 36, club: 'AIK' },
  // Defensores
  { number: 2, name: 'Gustaf Lagerbielke', position: 'DF', age: 25, club: 'Braga' },
  { number: 3, name: 'Victor Lindelöf', position: 'DF', age: 31, club: 'Aston Villa' },
  { number: 4, name: 'Isak Hien', position: 'DF', age: 26, club: 'Atalanta' },
  { number: 5, name: 'Gabriel Gudmundsson', position: 'DF', age: 26, club: 'Leeds' },
  { number: 6, name: 'Herman Johansson', position: 'DF', age: 27, club: 'FC Dallas' },
  { number: 8, name: 'Daniel Svensson', position: 'DF', age: 23, club: 'Borussia Dortmund' },
  { number: 14, name: 'Hjalmar Ekdal', position: 'DF', age: 26, club: 'Burnley' },
  { number: 15, name: 'Carl Starfelt', position: 'DF', age: 31, club: 'Celta Vigo' },
  { number: 20, name: 'Eric Smith', position: 'DF', age: 28, club: 'St Pauli' },
  { number: 24, name: 'Elliot Stroud', position: 'DF', age: 23, club: 'Mjällby' },
  // Volantes
  { number: 7, name: 'Lucas Bergvall', position: 'MF', age: 20, club: 'Tottenham' },
  { number: 16, name: 'Jesper Karlström', position: 'MF', age: 30, club: 'Udinese' },
  { number: 18, name: 'Yasin Ayari', position: 'MF', age: 23, club: 'Brighton' },
  { number: 19, name: 'Mattias Svanberg', position: 'MF', age: 27, club: 'Wolfsburg' },
  { number: 22, name: 'Besfort Zeneli', position: 'MF', age: 25, club: 'Union Saint-Gilloise' },
  // Delanteros
  { number: 9, name: 'Alexander Isak', position: 'FW', age: 26, club: 'Liverpool', captain: true },
  { number: 10, name: 'Benjamin Nygren', position: 'FW', age: 24, club: 'Celtic' },
  { number: 11, name: 'Anthony Elanga', position: 'FW', age: 24, club: 'Newcastle' },
  { number: 13, name: 'Ken Sema', position: 'FW', age: 27, club: 'Pafos FC' },
  { number: 17, name: 'Viktor Gyökeres', position: 'FW', age: 28, club: 'Arsenal' },
  { number: 21, name: 'Alexander Bernhardsson', position: 'FW', age: 27, club: 'Holstein Kiel' },
  { number: 25, name: 'Gustaf Nilsson', position: 'FW', age: 27, club: 'Club Brugge' },
  { number: 26, name: 'Taha Ali', position: 'FW', age: 28, club: 'Malmö FF' },
];

export const lineup = {
  formation: '3-4-3',
  startingXI: [23, 2, 4, 3, 6, 18, 16, 5, 7, 17, 9]
};
