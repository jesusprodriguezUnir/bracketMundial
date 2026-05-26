import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Matt Turner', position: 'GK', age: 31, club: 'Crystal Palace' },
  { number: 12, name: 'Matt Freese', position: 'GK', age: 27, club: 'New York City FC' },
  { number: 24, name: 'Chris Brady', position: 'GK', age: 22, club: 'Chicago Fire' },

  // Defensas
  { number: 2, name: 'Sergiño Dest', position: 'DF', age: 25, club: 'PSV' },
  { number: 3, name: 'Chris Richards', position: 'DF', age: 26, club: 'Crystal Palace' },
  { number: 4, name: 'Miles Robinson', position: 'DF', age: 29, club: 'FC Cincinnati' },
  { number: 5, name: 'Antonee Robinson', position: 'DF', age: 28, club: 'Fulham' },
  { number: 13, name: 'Tim Ream', position: 'DF', age: 38, club: 'Charlotte FC' },
  { number: 15, name: 'Joe Scally', position: 'DF', age: 23, club: 'Borussia M\'gladbach' },
  { number: 25, name: 'Alex Freeman', position: 'DF', age: 21, club: 'Villarreal' },
  { number: 26, name: 'Mark McKenzie', position: 'DF', age: 27, club: 'Toulouse' },
  { number: 27, name: 'Auston Trusty', position: 'DF', age: 27, club: 'Celtic' },
  { number: 28, name: 'Max Arfsten', position: 'DF', age: 25, club: 'Columbus Crew' },

  // Centrocampistas
  { number: 7, name: 'Giovanni Reyna', position: 'MF', age: 23, club: 'Borussia M\'gladbach' },
  { number: 8, name: 'Tyler Adams', position: 'MF', age: 27, club: 'Bournemouth', captain: true },
  { number: 16, name: 'Weston McKennie', position: 'MF', age: 27, club: 'Juventus' },
  { number: 17, name: 'Malik Tillman', position: 'MF', age: 24, club: 'Bayer Leverkusen' },
  { number: 30, name: 'Cristian Roldan', position: 'MF', age: 30, club: 'Seattle Sounders' },
  { number: 31, name: 'Sebastian Berhalter', position: 'MF', age: 25, club: 'Vancouver Whitecaps' },

  // Delanteros
  { number: 10, name: 'Christian Pulisic', position: 'FW', age: 27, club: 'AC Milan' },
  { number: 11, name: 'Tim Weah', position: 'FW', age: 26, club: 'Marseille' },
  { number: 19, name: 'Ricardo Pepi', position: 'FW', age: 23, club: 'PSV' },
  { number: 20, name: 'Brenden Aaronson', position: 'FW', age: 25, club: 'Leeds United' },
  { number: 21, name: 'Folarin Balogun', position: 'FW', age: 24, club: 'Monaco' },
  { number: 22, name: 'Alejandro Zendejas', position: 'FW', age: 28, club: 'América' },
  { number: 32, name: 'Haji Wright', position: 'FW', age: 28, club: 'Coventry City' }
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 13, 5, 8, 17, 16, 11, 21, 10]
};
