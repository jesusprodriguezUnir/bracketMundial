import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Gregor Kobel', position: 'GK', age: 28, club: 'Borussia Dortmund' },
  { number: 12, name: 'Yvon Mvogo', position: 'GK', age: 32, club: 'Lorient' },
  { number: 21, name: 'Marvin Keller', position: 'GK', age: 24, club: 'Young Boys' },
  // Defensores
  { number: 2, name: 'Miro Muheim', position: 'DF', age: 28, club: 'Hamburg' },
  { number: 3, name: 'Silvan Widmer', position: 'DF', age: 33, club: 'Mainz' },
  { number: 4, name: 'Nico Elvedi', position: 'DF', age: 29, club: 'Borussia Mönchengladbach' },
  { number: 5, name: 'Manuel Akanji', position: 'DF', age: 30, club: 'Inter' },
  { number: 13, name: 'Ricardo Rodriguez', position: 'DF', age: 33, club: 'Real Betis' },
  { number: 18, name: 'Eray Cömert', position: 'DF', age: 28, club: 'Valencia' },
  { number: 24, name: 'Aurèle Amenda', position: 'DF', age: 22, club: 'Eintracht Frankfurt' },
  { number: 25, name: 'Luca Jaquez', position: 'DF', age: 23, club: 'Stuttgart' },
  // Volantes
  { number: 6, name: 'Denis Zakaria', position: 'MF', age: 29, club: 'Monaco' },
  { number: 8, name: 'Remo Freuler', position: 'MF', age: 34, club: 'Bologna' },
  { number: 10, name: 'Granit Xhaka', position: 'MF', age: 33, club: 'Sunderland', captain: true },
  { number: 14, name: 'Ardon Jashari', position: 'MF', age: 23, club: 'Milan' },
  { number: 15, name: 'Djibril Sow', position: 'MF', age: 29, club: 'Sevilla' },
  { number: 16, name: 'Christian Fassnacht', position: 'MF', age: 32, club: 'Young Boys' },
  { number: 20, name: 'Michel Aebischer', position: 'MF', age: 29, club: 'Pisa' },
  { number: 22, name: 'Fabian Rieder', position: 'MF', age: 24, club: 'Augsburg' },
  // Delanteros
  { number: 7, name: 'Breel Embolo', position: 'FW', age: 29, club: 'Rennes' },
  { number: 9, name: 'Johan Manzambi', position: 'FW', age: 20, club: 'Freiburg' },
  { number: 11, name: 'Dan Ndoye', position: 'FW', age: 25, club: 'Nottingham Forest' },
  { number: 17, name: 'Ruben Vargas', position: 'FW', age: 28, club: 'Sevilla' },
  { number: 19, name: 'Noah Okafor', position: 'FW', age: 26, club: 'Leeds' },
  { number: 23, name: 'Zeki Amdouni', position: 'FW', age: 26, club: 'Burnley' },
  { number: 26, name: 'Cedric Itten', position: 'FW', age: 0, club: 'Fortuna Düsseldorf' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 13, 4, 5, 3, 8, 10, 22, 17, 7, 11]
};
