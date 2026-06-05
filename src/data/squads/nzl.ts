import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Max Crocombe', position: 'GK', age: 32, club: 'Millwall' },
  { number: 12, name: 'Alex Paulsen', position: 'GK', age: 24, club: 'Bournemouth' },
  { number: 22, name: 'Michael Woud', position: 'GK', age: 27, club: 'Auckland FC' },
  // Defensores
  { number: 2, name: 'Tim Payne', position: 'DF', age: 31, club: 'Wellington Phoenix' },
  { number: 3, name: 'Francis de Vries', position: 'DF', age: 31, club: 'Auckland FC' },
  { number: 4, name: 'Tyler Bindon', position: 'DF', age: 21, club: 'Sheffield United' },
  { number: 5, name: 'Michael Boxall', position: 'DF', age: 36, club: 'Minnesota United' },
  { number: 13, name: 'Liberato Cacace', position: 'DF', age: 25, club: 'Wrexham' },
  { number: 15, name: 'Nando Pijnaker', position: 'DF', age: 27, club: 'Auckland FC' },
  { number: 16, name: 'Finn Surman', position: 'DF', age: 22, club: 'Portland' },
  { number: 24, name: 'Callan Elliot', position: 'DF', age: 26, club: 'Auckland FC' },
  { number: 26, name: 'Tommy Smith', position: 'DF', age: 34, club: 'Braintree Town' },
  // Volantes
  { number: 6, name: 'Joe Bell', position: 'MF', age: 27, club: 'Viking' },
  { number: 7, name: 'Matt Garbett', position: 'MF', age: 24, club: 'Peterborough United' },
  { number: 8, name: 'Marko Stamenić', position: 'MF', age: 24, club: 'Swansea City' },
  { number: 10, name: 'Sarpreet Singh', position: 'MF', age: 27, club: 'Backa Topola' },
  { number: 14, name: 'Alex Rufer', position: 'MF', age: 29, club: 'Wellington Phoenix' },
  { number: 23, name: 'Ryan Thomas', position: 'MF', age: 31, club: 'PEC Zwolle' },
  { number: 25, name: 'Lachlan Bayliss', position: 'MF', age: 23, club: 'Newcastle Jets' },
  // Delanteros
  { number: 9, name: 'Chris Wood', position: 'FW', age: 34, club: 'Nottingham Forest', captain: true },
  { number: 11, name: 'Eli Just', position: 'FW', age: 26, club: 'Motherwell' },
  { number: 17, name: 'Kosta Barbarouses', position: 'FW', age: 35, club: 'Western Sydney Wanderers' },
  { number: 18, name: 'Ben Waine', position: 'FW', age: 24, club: 'Port Vale' },
  { number: 19, name: 'Ben Old', position: 'FW', age: 23, club: 'St Étienne' },
  { number: 20, name: 'Callum McCowatt', position: 'FW', age: 27, club: 'Silkeborg' },
  { number: 21, name: 'Jesse Randall', position: 'FW', age: 23, club: 'Auckland FC' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 4, 13, 6, 8, 7, 19, 9, 11]
};
