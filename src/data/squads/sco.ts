import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Angus Gunn',             position: 'GK', age: 29, club: 'Norwich City' },
  { number: 12, name: 'Craig Gordon',           position: 'GK', age: 42, club: 'Heart of Midlothian' },
  { number: 23, name: 'Zander Clark',           position: 'GK', age: 32, club: 'Heart of Midlothian' },
  { number: 2,  name: 'Aaron Hickey',           position: 'DF', age: 23, club: 'Brentford' },
  { number: 3,  name: 'Greg Taylor',            position: 'DF', age: 27, club: 'Celtic' },
  { number: 4,  name: 'Scott McKenna',          position: 'DF', age: 29, club: 'Nottingham Forest' },
  { number: 5,  name: 'Grant Hanley',           position: 'DF', age: 34, club: 'Norwich City', captain: true },
  { number: 6,  name: 'Liam Cooper',            position: 'DF', age: 33, club: 'Deportivo La Coruña' },
  { number: 22, name: 'Anthony Ralston',        position: 'DF', age: 26, club: 'Celtic' },
  { number: 15, name: 'Jack Hendry',            position: 'DF', age: 29, club: 'Club Brugge' },
  { number: 8,  name: 'John McGinn',            position: 'MF', age: 31, club: 'Aston Villa' },
  { number: 10, name: 'Callum McGregor',        position: 'MF', age: 31, club: 'Celtic' },
  { number: 14, name: 'Stuart Armstrong',       position: 'MF', age: 32, club: 'Southampton' },
  { number: 16, name: 'Billy Gilmour',          position: 'MF', age: 25, club: 'Napoli' },
  { number: 17, name: 'Kenny McLean',           position: 'MF', age: 33, club: 'Norwich City' },
  { number: 18, name: 'Ryan Jack',              position: 'MF', age: 33, club: 'Rangers' },
  { number: 7,  name: 'Ryan Christie',          position: 'MF', age: 30, club: 'Bournemouth' },
  { number: 9,  name: 'Lyndon Dykes',           position: 'FW', age: 29, club: 'QPR' },
  { number: 11, name: 'Che Adams',              position: 'FW', age: 29, club: 'Torino' },
  { number: 13, name: 'Lawrence Shankland',     position: 'FW', age: 29, club: 'Heart of Midlothian' },
  { number: 19, name: 'Scott Wright',           position: 'FW', age: 27, club: 'Rangers' },
  { number: 20, name: 'Dango Ouattara',         position: 'FW', age: 23, club: 'Bournemouth' },
  { number: 21, name: 'Ben Doak',               position: 'FW', age: 20, club: 'Liverpool' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 16, 10, 7, 8, 17, 11]
};

