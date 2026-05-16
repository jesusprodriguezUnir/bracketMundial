import type { Player } from './index';
export const squad: Player[] = [
  // Porteros
  { number: 1,  name: 'Yahia Fofana',        position: 'GK', age: 26, club: 'Angers' },
  { number: 16, name: 'Alban Lafont',         position: 'GK', age: 27, club: 'Nantes' },
  { number: 23, name: 'Mohamed Koné',         position: 'GK', age: 24, club: 'Charleroi' },
  // Defensas
  { number: 2,  name: 'Wilfried Singo',       position: 'DF', age: 25, club: 'Monaco' },
  { number: 3,  name: 'Ghislain Konan',       position: 'DF', age: 30, club: 'Al-Nassr' },
  { number: 4,  name: 'Ousmane Diomandé',     position: 'DF', age: 22, club: 'Sporting CP', captain: true },
  { number: 5,  name: 'Odilon Kossounou',     position: 'DF', age: 25, club: 'Atalanta' },
  { number: 6,  name: 'Evan Ndicka',          position: 'DF', age: 26, club: 'AS Roma' },
  { number: 13, name: 'Emmanuel Agbadou',     position: 'DF', age: 28, club: 'Reims' },
  { number: 15, name: 'Guéla Doué',           position: 'DF', age: 23, club: 'Strasbourg' },
  { number: 21, name: 'Clément Akpa',         position: 'DF', age: 24, club: 'Auxerre' },
  // Centrocampistas
  { number: 8,  name: 'Franck Kessié',        position: 'MF', age: 29, club: 'Al-Ahli' },
  { number: 10, name: 'Seko Fofana',          position: 'MF', age: 31, club: 'Al-Ettifaq' },
  { number: 14, name: 'Ibrahim Sangaré',      position: 'MF', age: 28, club: 'Nottingham Forest' },
  { number: 17, name: 'Jean Michaël Seri',    position: 'MF', age: 34, club: 'Al-Fayha' },
  { number: 18, name: 'Christ Inao Oulai',    position: 'MF', age: 23, club: 'Stade de Reims' },
  { number: 22, name: 'Parfait Guiagon',      position: 'MF', age: 25, club: 'Charleroi' },
  // Delanteros
  { number: 7,  name: 'Nicolas Pépé',         position: 'FW', age: 31, club: 'Villarreal' },
  { number: 9,  name: 'Elye Wahi',            position: 'FW', age: 23, club: 'Marseille' },
  { number: 11, name: 'Simon Adingra',        position: 'FW', age: 24, club: 'Brighton' },
  { number: 12, name: 'Amad Diallo',          position: 'FW', age: 23, club: 'Manchester United' },
  { number: 19, name: 'Evann Guessand',       position: 'FW', age: 25, club: 'Nice' },
  { number: 20, name: 'Yan Diomandé',         position: 'FW', age: 24, club: 'Feyenoord' },
  { number: 24, name: 'Oumar Diakité',        position: 'FW', age: 22, club: 'Reims' },
  { number: 25, name: 'Bazoumana Touré',      position: 'FW', age: 20, club: 'Hammarby IF' },
  { number: 26, name: 'Ange-Yoan Bonny',      position: 'FW', age: 22, club: 'Parma' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 6, 3, 8, 14, 10, 11, 9, 12]
};
