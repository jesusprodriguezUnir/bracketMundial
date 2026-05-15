import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Kristoffer Nordfeldt', position: 'GK', age: 36, club: 'AIK' },
  { number: 12, name: 'Viktor Johansson', position: 'GK', age: 27, club: 'Stoke City' },
  { number: 23, name: 'Jacob Widell Zetterström', position: 'GK', age: 26, club: 'Derby County' },
  { number: 2, name: 'Victor Lindelöf', position: 'DF', age: 31, club: 'Aston Villa' },
  { number: 3, name: 'Isak Hien', position: 'DF', age: 26, club: 'Atalanta' },
  { number: 5, name: 'Gabriel Gudmundsson', position: 'DF', age: 26, club: 'Leeds United' },
  { number: 6, name: 'Carl Starfelt', position: 'DF', age: 30, club: 'Celta Vigo' },
  { number: 7, name: 'Emil Holm', position: 'DF', age: 26, club: 'Juventus' },
  { number: 14, name: 'Hjalmar Ekdal', position: 'DF', age: 26, club: 'Burnley' },
  { number: 16, name: 'Daniel Svensson', position: 'DF', age: 27, club: 'Borussia Dortmund' },
  { number: 17, name: 'Gustaf Lagerbielke', position: 'DF', age: 25, club: 'Braga' },
  { number: 18, name: 'Eric Smith', position: 'DF', age: 24, club: 'St. Pauli' },
  { number: 20, name: 'Elliot Stroud', position: 'DF', age: 23, club: 'Mjällby AIF' },
  { number: 8, name: 'Mattias Svanberg', position: 'MF', age: 26, club: 'Wolfsburg' },
  { number: 10, name: 'Jesper Karlström', position: 'MF', age: 30, club: 'Udinese' },
  { number: 11, name: 'Yasin Ayari', position: 'MF', age: 22, club: 'Brighton & Hove Albion' },
  { number: 13, name: 'Lucas Bergvall', position: 'MF', age: 19, club: 'Tottenham Hotspur' },
  { number: 15, name: 'Besfort Zeneli', position: 'MF', age: 25, club: 'Union Saint-Gilloise' },
  { number: 19, name: 'Ken Sema', position: 'MF', age: 27, club: 'Pafos' },
  { number: 9, name: 'Alexander Isak', position: 'FW', age: 26, club: 'Liverpool', captain: true },
  { number: 21, name: 'Viktor Gyökeres', position: 'FW', age: 27, club: 'Arsenal' },
  { number: 22, name: 'Anthony Elanga', position: 'FW', age: 24, club: 'Newcastle United' },
  { number: 23, name: 'Benjamin Nygren', position: 'FW', age: 24, club: 'Celtic' },
  { number: 24, name: 'Alexander Bernhardsson', position: 'FW', age: 24, club: 'Holstein Kiel' },
  { number: 25, name: 'Gustaf Nilsson', position: 'FW', age: 27, club: 'Club Brugge' },
  { number: 26, name: 'Taha Ali', position: 'FW', age: 23, club: 'Malmö FF' },
];

export const lineup = {
  formation: '4-4-2',
  startingXI: [12, 7, 2, 3, 5, 22, 8, 13, 19, 9, 21]
};