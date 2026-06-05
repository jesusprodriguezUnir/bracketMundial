import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Matt Turner', position: 'GK', age: 31, club: 'New England Revolution' },
  { number: 24, name: 'Matt Freese', position: 'GK', age: 28, club: 'New York City FC' },
  { number: 25, name: 'Chris Brady', position: 'GK', age: 22, club: 'Chicago Fire' },
  // Defensores
  { number: 2, name: 'Sergiño Dest', position: 'DF', age: 26, club: 'PSV Eindhoven' },
  { number: 3, name: 'Chris Richards', position: 'DF', age: 26, club: 'Crystal Palace' },
  { number: 5, name: 'Antonee Robinson', position: 'DF', age: 28, club: 'Fulham' },
  { number: 6, name: 'Auston Trusty', position: 'DF', age: 27, club: 'Celtic' },
  { number: 12, name: 'Miles Robinson', position: 'DF', age: 29, club: 'FC Cincinnati' },
  { number: 13, name: 'Tim Ream', position: 'DF', age: 39, club: 'Charlotte' },
  { number: 16, name: 'Alex Freeman', position: 'DF', age: 21, club: 'Villarreal' },
  { number: 18, name: 'Max Arfsten', position: 'DF', age: 25, club: 'Columbus Crew' },
  { number: 22, name: 'Mark McKenzie', position: 'DF', age: 27, club: 'Toulouse' },
  { number: 23, name: 'Joe Scally', position: 'DF', age: 23, club: 'Borussia Mönchengladbach' },
  // Volantes
  { number: 4, name: 'Tyler Adams', position: 'MF', age: 27, club: 'Bournemouth', captain: true },
  { number: 7, name: 'Gio Reyna', position: 'MF', age: 23, club: 'Borussia Mönchengladbach' },
  { number: 8, name: 'Weston McKennie', position: 'MF', age: 27, club: 'Juventus' },
  { number: 11, name: 'Brenden Aaronson', position: 'MF', age: 25, club: 'Leeds' },
  { number: 14, name: 'Sebastian Berhalter', position: 'MF', age: 24, club: 'Vancouver Whitecaps' },
  { number: 15, name: 'Cristian Roldan', position: 'MF', age: 31, club: 'Seattle Sounders' },
  // Delanteros
  { number: 9, name: 'Ricardo Pepi', position: 'FW', age: 22, club: 'PSV Eindhoven' },
  { number: 10, name: 'Christian Pulisic', position: 'FW', age: 27, club: 'Milan' },
  { number: 17, name: 'Malik Tillman', position: 'FW', age: 24, club: 'Bayer Leverkusen' },
  { number: 19, name: 'Haji Wright', position: 'FW', age: 28, club: 'Coventry City' },
  { number: 20, name: 'Folarin Balogun', position: 'FW', age: 25, club: 'Monaco' },
  { number: 21, name: 'Tim Weah', position: 'FW', age: 26, club: 'Marseille' },
  { number: 26, name: 'Alejandro Zendejas', position: 'FW', age: 27, club: 'Club América' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 3, 13, 5, 4, 17, 8, 21, 20, 10]
};
