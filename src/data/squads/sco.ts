import type { Player } from './index';
export const coach = 'Steve Clarke';
export const squad: Player[] = [
  { number: 1,  name: 'Angus Gunn',             position: 'GK', age: 30, club: 'Norwich City' },
  { number: 12, name: 'Craig Gordon',           position: 'GK', age: 43, club: 'Heart of Midlothian' },
  { number: 23, name: 'Liam Kelly',             position: 'GK', age: 30, club: 'Rangers' },

  { number: 2,  name: 'Aaron Hickey',           position: 'DF', age: 24, club: 'Brentford' },
  { number: 3,  name: 'Andy Robertson',         position: 'DF', age: 32, club: 'Liverpool', captain: true },
  { number: 4,  name: 'Scott McKenna',          position: 'DF', age: 29, club: 'Dinamo Zagreb' },
  { number: 5,  name: 'Grant Hanley',           position: 'DF', age: 34, club: 'Hibernian' },
  { number: 6,  name: 'Kieran Tierney',         position: 'DF', age: 29, club: 'Celtic' },
  { number: 13, name: 'Nathan Patterson',       position: 'DF', age: 24, club: 'Everton' },
  { number: 14, name: 'John Souttar',           position: 'DF', age: 29, club: 'Rangers' },
  { number: 15, name: 'Jack Hendry',            position: 'DF', age: 31, club: 'Al-Ettifaq' },
  { number: 22, name: 'Anthony Ralston',        position: 'DF', age: 27, club: 'Celtic' },
  { number: 25, name: 'Dom Hyam',               position: 'DF', age: 30, club: 'Blackburn Rovers' },

  { number: 7,  name: 'Ryan Christie',          position: 'MF', age: 31, club: 'Bournemouth' },
  { number: 8,  name: 'John McGinn',            position: 'MF', age: 31, club: 'Aston Villa' },
  { number: 10, name: 'Scott McTominay',        position: 'MF', age: 29, club: 'Napoli' },
  { number: 16, name: 'Billy Gilmour',          position: 'MF', age: 25, club: 'Napoli' },
  { number: 18, name: 'Lewis Ferguson',         position: 'MF', age: 26, club: 'Bologna' },
  { number: 20, name: 'Findlay Curtis',          position: 'MF', age: 20, club: 'Hearts' },
  { number: 21, name: 'Ben Gannon-Doak',         position: 'MF', age: 20, club: 'Liverpool' },
  { number: 24, name: 'Kenny McLean',           position: 'MF', age: 34, club: 'Norwich City' },

  { number: 9,  name: 'Lyndon Dykes',           position: 'FW', age: 30, club: 'Queens Park Rangers' },
  { number: 11, name: 'Ché Adams',              position: 'FW', age: 30, club: 'Torino' },
  { number: 17, name: 'George Hirst',           position: 'FW', age: 27, club: 'Ipswich Town' },
  { number: 19, name: 'Lawrence Shankland',     position: 'FW', age: 30, club: 'Heart of Midlothian' },
  { number: 26, name: 'Ross Stewart',           position: 'FW', age: 29, club: 'Southampton' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 14, 4, 2, 18, 10, 8, 7, 19, 21]
};
