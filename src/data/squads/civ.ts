import type { Player } from './index';
export const squad: Player[] = [
  // Porteros
  { number: 1,  name: 'Yahia Fofana',        position: 'GK', age: 26, club: 'Çaykur Rizespor' },
  { number: 16, name: 'Alban Lafont',         position: 'GK', age: 26, club: 'Panathinaikos' },
  { number: 23, name: 'Mohamed Koné',         position: 'GK', age: 24, club: 'Charleroi' },
  // Defensas
  { number: 2,  name: 'Wilfried Singo',       position: 'DF', age: 24, club: 'Galatasaray' },
  { number: 3,  name: 'Ghislain Konan',       position: 'DF', age: 29, club: 'Gil Vicente' },
  { number: 4,  name: 'Ousmane Diomandé',     position: 'DF', age: 21, club: 'Sporting CP', captain: true },
  { number: 5,  name: 'Odilon Kossounou',     position: 'DF', age: 24, club: 'Atalanta' },
  { number: 6,  name: 'Evan Ndicka',          position: 'DF', age: 25, club: 'AS Roma' },
  { number: 13, name: 'Emmanuel Agbadou',     position: 'DF', age: 27, club: 'Beşiktaş' },
  { number: 15, name: 'Guéla Doué',           position: 'DF', age: 25, club: 'Estrasburgo' },
  { number: 21, name: 'Clément Akpa',         position: 'DF', age: 24, club: 'Auxerre' },
  // Centrocampistas
  { number: 8,  name: 'Franck Kessié',        position: 'MF', age: 29, club: 'Al-Ahli' },
  { number: 10, name: 'Seko Fofana',          position: 'MF', age: 29, club: 'Porto' },
  { number: 14, name: 'Ibrahim Sangaré',      position: 'MF', age: 27, club: 'Nottingham Forest' },
  { number: 17, name: 'Jean Michaël Seri',    position: 'MF', age: 33, club: 'Maribor' },
  { number: 18, name: 'Christ Oulain',        position: 'MF', age: 23, club: 'Trabzonspor' },
  { number: 22, name: 'Parfait Guiagon',      position: 'MF', age: 22, club: 'Charleroi' },
  // Delanteros
  { number: 7,  name: 'Nicolas Pépé',         position: 'FW', age: 31, club: 'Villarreal' },
  { number: 9,  name: 'Elye Wahi',            position: 'FW', age: 22, club: 'Nice' },
  { number: 11, name: 'Simon Adingra',        position: 'FW', age: 23, club: 'Monaco' },
  { number: 12, name: 'Amad Diallo',          position: 'FW', age: 22, club: 'Manchester United' },
  { number: 19, name: 'Evann Guessand',       position: 'FW', age: 23, club: 'Crystal Palace' },
  { number: 20, name: 'Yan Diomandé',         position: 'FW', age: 24, club: 'RB Leipzig' },
  { number: 24, name: 'Oumar Diakité',        position: 'FW', age: 26, club: 'Cercle Brugge' },
  { number: 25, name: 'Bazoumana Touré',      position: 'FW', age: 22, club: 'Hoffenheim' },
  { number: 26, name: 'Ange-Yoan Bonny',      position: 'FW', age: 22, club: 'Inter Milan' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 6, 3, 8, 14, 10, 11, 9, 12]
};
