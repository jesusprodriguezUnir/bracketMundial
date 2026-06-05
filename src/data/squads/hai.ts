import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Johny Placide', position: 'GK', age: 38, club: 'Bastia', captain: true },
  { number: 12, name: 'Alexandre Pierre', position: 'GK', age: 25, club: 'Sochaux' },
  { number: 23, name: 'Josué Duverger', position: 'GK', age: 26, club: 'Cosmos Koblenz' },
  // Defensores
  { number: 2, name: 'Carlens Arcus', position: 'DF', age: 29, club: 'Angers' },
  { number: 3, name: 'Keeto Thermoncy', position: 'DF', age: 0, club: 'Young Boys' },
  { number: 4, name: 'Ricardo Adé', position: 'DF', age: 36, club: 'LDU Quito' },
  { number: 5, name: 'Hannes Delcroix', position: 'DF', age: 27, club: 'Lugano' },
  { number: 8, name: 'Martin Expérience', position: 'DF', age: 26, club: 'AS Nancy' },
  { number: 13, name: 'Duke Lacroix', position: 'DF', age: 32, club: 'Colorado Springs Switchbacks' },
  { number: 22, name: 'Jean-Kévin Duverne', position: 'DF', age: 28, club: 'Nantes' },
  { number: 24, name: 'Wilguens Paugain', position: 'DF', age: 24, club: 'Zulte Waregem' },
  // Volantes
  { number: 6, name: 'Carl Fred Sainté', position: 'MF', age: 23, club: 'El Paso Locomotive' },
  { number: 10, name: 'Jean-Ricner Bellegarde', position: 'MF', age: 27, club: 'Wolves' },
  { number: 14, name: 'Leverton Pierre', position: 'MF', age: 27, club: 'Vizela' },
  { number: 17, name: 'Danley Jean Jacques', position: 'MF', age: 26, club: 'Philadelphia Union' },
  { number: 25, name: 'Dominique Simon', position: 'MF', age: 0, club: 'Tatran Presov' },
  { number: 26, name: 'Woodensky Pierre', position: 'MF', age: 21, club: 'Violette AC' },
  // Delanteros
  { number: 7, name: 'Derrick Etienne Jr', position: 'FW', age: 29, club: 'Toronto FC' },
  { number: 9, name: 'Duckens Nazon', position: 'FW', age: 31, club: 'Esteghlal' },
  { number: 11, name: 'Louicius Deedson', position: 'FW', age: 24, club: 'FC Dallas' },
  { number: 15, name: 'Ruben Providence', position: 'FW', age: 24, club: 'Almere City FC' },
  { number: 16, name: 'Lenny Joseph', position: 'FW', age: 25, club: 'Ferencvaros' },
  { number: 18, name: 'Wilson Isidor', position: 'FW', age: 25, club: 'Sunderland' },
  { number: 19, name: 'Yassin Fortuné', position: 'FW', age: 27, club: 'Vizela' },
  { number: 20, name: 'Frantzdy Pierrot', position: 'FW', age: 31, club: 'AEK Athens' },
  { number: 21, name: 'Josué Casimir', position: 'FW', age: 24, club: 'Auxerre' },
];

export const lineup = {
  formation: '4-4-2',
  startingXI: [1, 2, 4, 22, 5, 7, 10, 17, 9, 18]
};
