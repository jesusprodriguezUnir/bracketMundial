import type { Player } from './index';

export const coach = 'Steve Clarke';
export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Angus Gunn', position: 'GK', age: 30, club: 'Nottingham Forest' },
  { number: 12, name: 'Liam Kelly', position: 'GK', age: 30, club: 'Rangers' },
  { number: 21, name: 'Craig Gordon', position: 'GK', age: 43, club: 'Hearts' },
  // Defensores
  { number: 2, name: 'Aaron Hickey', position: 'DF', age: 23, club: 'Brentford' },
  { number: 3, name: 'Andy Robertson', position: 'DF', age: 31, club: 'Liverpool', captain: true },
  { number: 5, name: 'Grant Hanley', position: 'DF', age: 34, club: 'Hibernian' },
  { number: 6, name: 'Kieran Tierney', position: 'DF', age: 29, club: 'Celtic' },
  { number: 13, name: 'Jack Hendry', position: 'DF', age: 30, club: 'At-Ettifaq' },
  { number: 15, name: 'John Souttar', position: 'DF', age: 29, club: 'Rangers' },
  { number: 16, name: 'Dominic Hyam', position: 'DF', age: 30, club: 'Wrexham' },
  { number: 22, name: 'Nathan Patterson', position: 'DF', age: 24, club: 'Everton' },
  { number: 24, name: 'Anthony Ralston', position: 'DF', age: 27, club: 'Celtic' },
  { number: 26, name: 'Scott McKenna', position: 'DF', age: 29, club: 'Dinamo Zagreb' },
  // Volantes
  { number: 4, name: 'Scott McTominay', position: 'MF', age: 29, club: 'Napoli' },
  { number: 7, name: 'John McGinn', position: 'MF', age: 31, club: 'Aston Villa' },
  { number: 8, name: 'Tyler Fletcher', position: 'MF', age: 0, club: 'Manchester United' },
  { number: 19, name: 'Lewis Ferguson', position: 'MF', age: 26, club: 'Bologna' },
  { number: 23, name: 'Kenny McLean', position: 'MF', age: 33, club: 'Norwich City' },
  // Delanteros
  { number: 9, name: 'Lyndon Dykes', position: 'FW', age: 30, club: 'Charlton' },
  { number: 10, name: 'Che Adams', position: 'FW', age: 30, club: 'Torino' },
  { number: 11, name: 'Ryan Christie', position: 'FW', age: 31, club: 'Bournemouth' },
  { number: 14, name: 'Ross Stewart', position: 'FW', age: 29, club: 'Southampton' },
  { number: 17, name: 'Ben Gannon-Doak', position: 'FW', age: 20, club: 'Bournemouth' },
  { number: 18, name: 'George Hirst', position: 'FW', age: 27, club: 'Ipswich' },
  { number: 20, name: 'Lawrence Shankland', position: 'FW', age: 30, club: 'Rangers' },
  { number: 25, name: 'Findlay Curtis', position: 'FW', age: 20, club: 'Rangers' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 15, 26, 2, 19, 4, 7, 11, 20, 17]
};
