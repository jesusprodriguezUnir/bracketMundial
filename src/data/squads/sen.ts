import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Yehvann Diouf', position: 'GK', age: 26, club: 'Nice' },
  { number: 16, name: 'Édouard Mendy', position: 'GK', age: 34, club: 'Al-Ahli' },
  { number: 23, name: 'Mory Diaw', position: 'GK', age: 33, club: 'Le Havre' },
  // Defensores
  { number: 2, name: 'Mamadou Sarr', position: 'DF', age: 20, club: 'Chelsea' },
  { number: 3, name: 'Kalidou Koulibaly', position: 'DF', age: 35, club: 'Al-Hilal', captain: true },
  { number: 4, name: 'Abdoulaye Seck', position: 'DF', age: 34, club: 'Maccabi Haifa' },
  { number: 14, name: 'Ismail Jakobs', position: 'DF', age: 28, club: 'Galatasaray' },
  { number: 19, name: 'Moussa Niakhaté', position: 'DF', age: 29, club: 'Lyon' },
  { number: 24, name: 'Antoine Mendy', position: 'DF', age: 22, club: 'Nice' },
  { number: 25, name: 'El Hadji Malick Diouf', position: 'DF', age: 22, club: 'West Ham' },
  // Volantes
  { number: 5, name: 'Idrissa ‘Gana’ Gueye', position: 'MF', age: 37, club: 'Everton' },
  { number: 6, name: 'Pathé Ciss', position: 'MF', age: 32, club: 'Rayo Vallecano' },
  { number: 8, name: 'Lamine Camara', position: 'MF', age: 22, club: 'Monaco' },
  { number: 17, name: 'Pape Matar Sarr', position: 'MF', age: 24, club: 'Tottenham' },
  { number: 21, name: 'Habib Diarra', position: 'MF', age: 22, club: 'Sunderland' },
  { number: 22, name: 'Bara Sapoko Ndiaye', position: 'MF', age: 0, club: 'Bayern Munich' },
  { number: 26, name: 'Pape Gueye', position: 'MF', age: 27, club: 'Villarreal' },
  // Delanteros
  { number: 7, name: 'Assane Diao', position: 'FW', age: 20, club: 'Como' },
  { number: 9, name: 'Bamba Dieng', position: 'FW', age: 26, club: 'Lorient' },
  { number: 10, name: 'Sadio Mané', position: 'FW', age: 33, club: 'Al-Nassr' },
  { number: 11, name: 'Nicolas Jackson', position: 'FW', age: 25, club: 'Chelsea' },
  { number: 12, name: 'Cherif Ndiaye', position: 'FW', age: 30, club: 'Samsunspor' },
  { number: 13, name: 'Iliman Ndiaye', position: 'FW', age: 26, club: 'Everton' },
  { number: 15, name: 'Krépin Diatta', position: 'FW', age: 26, club: 'Monaco' },
  { number: 18, name: 'Ismaïla Sarr', position: 'FW', age: 28, club: 'Crystal Palace' },
  { number: 20, name: 'Ibrahim Mbaye', position: 'FW', age: 18, club: 'Paris St-Germain' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [16, 8, 3, 19, 14, 17, 5, 18, 11, 10]
};
