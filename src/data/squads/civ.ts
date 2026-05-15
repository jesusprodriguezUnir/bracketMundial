import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Yahia Fofana',           position: 'GK', age: 35, club: 'Lens' },
  { number: 16, name: 'Badra Ali Sangaré',      position: 'GK', age: 28, club: 'Stade d\'Abidjan' },
  { number: 23, name: 'Willy Domoraud',         position: 'GK', age: 31, club: 'ASEC Mimosas' },
  { number: 2,  name: 'Serge Aurier',           position: 'DF', age: 33, club: 'Nottingham Forest' },
  { number: 3,  name: 'Ghislain Konan',         position: 'DF', age: 28, club: 'Reims' },
  { number: 4,  name: 'Wilfried Singo',         position: 'DF', age: 24, club: 'Monaco' },
  { number: 5,  name: 'Odilon Kossounou',       position: 'DF', age: 24, club: 'Bayer Leverkusen' },
  { number: 13, name: 'Eric Bailly',            position: 'DF', age: 32, club: 'LOSC Lille' },
  { number: 15, name: 'Diallo Namohori',        position: 'DF', age: 26, club: 'ASEC Mimosas' },
  { number: 6,  name: 'Jean-Michaël Seri',      position: 'MF', age: 32, club: 'Hull City' },
  { number: 8,  name: 'Ibrahim Sangaré',        position: 'MF', age: 27, club: 'Nottingham Forest' },
  { number: 10, name: 'Franck Kessié',          position: 'MF', age: 29, club: 'Barcelona', captain: true },
  { number: 14, name: 'Seko Fofana',            position: 'MF', age: 29, club: 'Al-Qadsiah' },
  { number: 17, name: 'Stéphane Gradel',        position: 'MF', age: 37, club: 'ASEC Mimosas' },
  { number: 18, name: 'Max-Alain Gradel',       position: 'FW', age: 37, club: 'ASEC Mimosas' },
  { number: 7,  name: 'Nicolas Pépé',           position: 'FW', age: 31, club: 'Al-Khelaifi' },
  { number: 9,  name: 'Jean-Philippe Krasso',   position: 'FW', age: 28, club: 'ASEC Mimosas' },
  { number: 11, name: 'Simon Deli',             position: 'DF', age: 32, club: 'Club Brugge' },
  { number: 19, name: 'Oumar Diakité',          position: 'FW', age: 26, club: 'Stade d\'Abidjan' },
  { number: 20, name: 'Emmanuel Kouadio',       position: 'FW', age: 24, club: 'ASEC Mimosas' },
  { number: 21, name: 'Willy Boly',             position: 'DF', age: 33, club: 'Nottingham Forest' },
  { number: 22, name: 'Simon Adingra',          position: 'FW', age: 23, club: 'Brighton' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 21, 3, 10, 8, 14, 7, 9, 22]
};

