import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Eloy Room', position: 'GK', age: 37, club: 'Miami FC' },
  { number: 25, name: 'Tyrick Bodak', position: 'GK', age: 24, club: 'Telstar' },
  { number: 26, name: 'Trevor Doornbusch', position: 'GK', age: 27, club: 'VVV-Venlo' },
  // Defensores
  { number: 2, name: 'Shurandy Sambo', position: 'DF', age: 24, club: 'Burnley' },
  { number: 3, name: 'Juriën Gaari', position: 'DF', age: 32, club: 'Abha' },
  { number: 4, name: 'Roshon van Eijma', position: 'DF', age: 27, club: 'RKC Waalwijk' },
  { number: 5, name: 'Sherel Floranus', position: 'DF', age: 27, club: 'PEC Zwolle' },
  { number: 18, name: 'Armando Obispo', position: 'DF', age: 27, club: 'PSV Eindhoven' },
  { number: 20, name: 'Joshua Brenet', position: 'DF', age: 32, club: 'Kayserispor' },
  { number: 23, name: 'Riechedly Bazoer', position: 'DF', age: 29, club: 'Konyaspor' },
  { number: 24, name: 'Deveron Fonville', position: 'DF', age: 23, club: 'NEC Nigmegen' },
  // Volantes
  { number: 6, name: 'Godfried Roemeratoe', position: 'MF', age: 26, club: 'RKC Waalwijk' },
  { number: 7, name: 'Juninho Bacuna', position: 'MF', age: 28, club: 'Gaziantep' },
  { number: 8, name: 'Livano Comenencia', position: 'MF', age: 22, club: 'FC Zurich' },
  { number: 10, name: 'Leandro Bacuna', position: 'MF', age: 34, club: 'Igdir' },
  { number: 13, name: 'Tyrese Noslin', position: 'MF', age: 23, club: 'SC Telstar' },
  { number: 15, name: 'Ar\'jany Martha', position: 'MF', age: 23, club: 'Rotherham' },
  { number: 22, name: 'Kevin Felida', position: 'MF', age: 26, club: 'FC Den Bosch' },
  // Delanteros
  { number: 9, name: 'Jürgen Locadia', position: 'FW', age: 32, club: 'Miami FC', captain: true },
  { number: 11, name: 'Jeremy Antonisse', position: 'FW', age: 24, club: 'Kifisia' },
  { number: 12, name: 'Sontje Hansen', position: 'FW', age: 24, club: 'Middlesbrough' },
  { number: 14, name: 'Kenji Gorré', position: 'FW', age: 31, club: 'Maccabi Haifa' },
  { number: 16, name: 'Jearl Margaritha', position: 'FW', age: 25, club: 'Beveren' },
  { number: 17, name: 'Brandley Kuwas', position: 'FW', age: 33, club: 'Volendam' },
  { number: 19, name: 'Gervane Kastaneer', position: 'FW', age: 29, club: 'Terengganu FC' },
  { number: 21, name: 'Tahith Chong', position: 'FW', age: 27, club: 'Sheffield United' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 18, 23, 20, 10, 6, 7, 21, 9, 12]
};
