import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Manuel Neuer',           position: 'GK', age: 40, club: 'Bayern Munich', captain: true },
  { number: 12, name: 'Marc-André ter Stegen',  position: 'GK', age: 34, club: 'Barcelona' },
  { number: 23, name: 'Oliver Baumann',         position: 'GK', age: 35, club: 'Hoffenheim' },
  { number: 2,  name: 'Joshua Kimmich',         position: 'DF', age: 31, club: 'Bayern Munich' },
  { number: 3,  name: 'David Raum',             position: 'DF', age: 27, club: 'RB Leipzig' },
  { number: 4,  name: 'Jonathan Tah',           position: 'DF', age: 30, club: 'Bayern Munich' },
  { number: 5,  name: 'Nico Schlotterbeck',     position: 'DF', age: 26, club: 'Borussia Dortmund' },
  { number: 13, name: 'Benjamin Henrichs',      position: 'DF', age: 29, club: 'RB Leipzig' },
  { number: 15, name: 'Robin Gosens',           position: 'DF', age: 31, club: 'Union Berlin' },
  { number: 22, name: 'Malick Thiaw',           position: 'DF', age: 24, club: 'AC Milan' },
  { number: 6,  name: 'Toni Kroos',             position: 'MF', age: 36, club: 'Real Madrid' },
  { number: 8,  name: 'Leon Goretzka',          position: 'MF', age: 31, club: 'Bayern Munich' },
  { number: 10, name: 'Florian Wirtz',          position: 'MF', age: 23, club: 'Bayer Leverkusen' },
  { number: 14, name: 'Jamal Musiala',          position: 'MF', age: 23, club: 'Bayern Munich' },
  { number: 16, name: 'Leroy Sané',             position: 'FW', age: 30, club: 'Bayern Munich' },
  { number: 17, name: 'Ilkay Gündogan',         position: 'MF', age: 35, club: 'Barcelona' },
  { number: 18, name: 'Pascal Groß',            position: 'MF', age: 35, club: 'Borussia Dortmund' },
  { number: 7,  name: 'Kai Havertz',            position: 'FW', age: 27, club: 'Arsenal' },
  { number: 9,  name: 'Niclas Füllkrug',        position: 'FW', age: 33, club: 'West Ham' },
  { number: 11, name: 'Serge Gnabry',           position: 'FW', age: 30, club: 'Bayern Munich' },
  { number: 19, name: 'Thomas Müller',          position: 'FW', age: 36, club: 'Bayern Munich' },
  { number: 20, name: 'Deniz Undav',            position: 'FW', age: 29, club: 'Stuttgart' },
  { number: 21, name: 'Chris Führich',          position: 'FW', age: 27, club: 'Stuttgart' },
  { number: 24, name: 'Aleksandar Pavlović',    position: 'MF', age: 21, club: 'Bayern Munich' },
  { number: 25, name: 'Tim Kleindienst',        position: 'FW', age: 29, club: 'Borussia M\'gladbach' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 6, 8, 16, 10, 14, 7]
};
