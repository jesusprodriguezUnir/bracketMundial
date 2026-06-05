import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Yahia Fofana', position: 'GK', age: 26, club: 'Caykur Rizespor' },
  { number: 16, name: 'Mohamed Koné', position: 'GK', age: 23, club: 'Charleroi' },
  { number: 23, name: 'Alban Lafont', position: 'GK', age: 27, club: 'Nantes' },
  // Defensores
  { number: 2, name: 'Ousmane Diomandé', position: 'DF', age: 23, club: 'Sporting', captain: true },
  { number: 3, name: 'Ghislain Konan', position: 'DF', age: 30, club: 'Gil Vicente' },
  { number: 5, name: 'Wilfried Singo', position: 'DF', age: 25, club: 'Galatasaray' },
  { number: 7, name: 'Odilon Kossounou', position: 'DF', age: 25, club: 'Atalanta' },
  { number: 13, name: 'Christopher Opéri', position: 'DF', age: 0, club: 'Basaksehir' },
  { number: 17, name: 'Guela Doué', position: 'DF', age: 23, club: 'Strasbourg' },
  { number: 20, name: 'Emmanuel Agbadou', position: 'DF', age: 28, club: 'Besiktas' },
  { number: 21, name: 'Evan Ndicka', position: 'DF', age: 26, club: 'Roma' },
  // Volantes
  { number: 4, name: 'Jean Michaël Seri', position: 'MF', age: 34, club: 'Maribor' },
  { number: 6, name: 'Séko Fofana', position: 'MF', age: 30, club: 'Porto' },
  { number: 8, name: 'Franck Kessié', position: 'MF', age: 29, club: 'Al-Ahli' },
  { number: 18, name: 'Ibrahim Sangaré', position: 'MF', age: 29, club: 'Nottingham Forest' },
  { number: 25, name: 'Parfait Guiagon', position: 'MF', age: 25, club: 'Charleroi' },
  // Delanteros
  { number: 9, name: 'Ange-Yoan Bonny', position: 'FW', age: 22, club: 'Inter' },
  { number: 10, name: 'Simon Adingra', position: 'FW', age: 24, club: 'Sunderland' },
  { number: 11, name: 'Yan Diomandé', position: 'FW', age: 24, club: 'RB Leipzig' },
  { number: 12, name: 'Elye Wahi', position: 'FW', age: 23, club: 'Eintracht Frankfurt' },
  { number: 14, name: 'Oumar Diakité', position: 'FW', age: 22, club: 'Cercle Bruges' },
  { number: 15, name: 'Amad Diallo', position: 'FW', age: 23, club: 'Manchester United' },
  { number: 19, name: 'Nicolas Pépé', position: 'FW', age: 31, club: 'Villareal' },
  { number: 22, name: 'Evann Guessand', position: 'FW', age: 25, club: 'Aston Villa' },
  { number: 24, name: 'Bazoumana Touré', position: 'FW', age: 20, club: 'Hoffenheim' },
  { number: 26, name: 'Christ Inao Oulaï', position: 'FW', age: 20, club: 'Trabzonspor' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 17, 7, 21, 3, 8, 18, 6, 15, 9, 11]
};
