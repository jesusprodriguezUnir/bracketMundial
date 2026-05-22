import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Édouard Mendy', position: 'GK', age: 34, club: 'Al Ahli' },
  { number: 16, name: 'Mory Diaw', position: 'GK', age: 33, club: 'Le Havre' },
  { number: 23, name: 'Yehvann Diouf', position: 'GK', age: 26, club: 'Nice' },
  { number: 2, name: 'Krépin Diatta', position: 'DF', age: 26, club: 'Monaco' },
  { number: 3, name: 'Kalidou Koulibaly', position: 'DF', age: 35, club: 'Al Ahli', captain: true },
  { number: 4, name: 'Moussa Niakhaté', position: 'DF', age: 30, club: 'Lyon' },
  { number: 12, name: 'El Hadji Malick Diouf', position: 'DF', age: 22, club: 'West Ham' },
  { number: 13, name: 'Ismaïl Jakobs', position: 'DF', age: 28, club: 'Galatasaray' },
  { number: 14, name: 'Antoine Mendy', position: 'DF', age: 22, club: 'Nice' },
  { number: 15, name: 'Mamadou Sarr', position: 'DF', age: 20, club: 'Strasbourg' },
  { number: 20, name: 'Moustapha Mbow', position: 'DF', age: 20, club: 'Paris Saint-Germain' },
  { number: 21, name: 'Abdoulaye Seck', position: 'DF', age: 32, club: 'Maccabi Haifa' },
  { number: 22, name: 'Ilay Camara', position: 'DF', age: 21, club: 'Anderlecht' },
  { number: 5, name: 'Pape Gueye', position: 'MF', age: 27, club: 'Villarreal' },
  { number: 6, name: 'Pathé Ciss', position: 'MF', age: 32, club: 'Rayo Vallecano' },
  { number: 8, name: 'Pape Matar Sarr', position: 'MF', age: 24, club: 'Tottenham Hotspur' },
  { number: 10, name: 'Lamine Camara', position: 'MF', age: 22, club: 'Monaco' },
  { number: 17, name: 'Idrissa Gana Gueye', position: 'MF', age: 37, club: 'Everton' },
  { number: 18, name: 'Habib Diarra', position: 'MF', age: 23, club: 'Sunderland' },
  { number: 24, name: 'Bara Sapoko Ndiaye', position: 'MF', age: 20, club: 'Bayern Munich' },
  { number: 7, name: 'Ismaïla Sarr', position: 'FW', age: 28, club: 'Crystal Palace' },
  { number: 9, name: 'Cherif Ndiaye', position: 'FW', age: 30, club: 'Samsunspor' },
  { number: 11, name: 'Sadio Mané', position: 'FW', age: 34, club: 'Al Nassr' },
  { number: 19, name: 'Nicolas Jackson', position: 'FW', age: 25, club: 'Bayern Munich' },
  { number: 25, name: 'Iliman Ndiaye', position: 'FW', age: 26, club: 'Everton' },
  { number: 26, name: 'Assane Diao', position: 'FW', age: 21, club: 'Como' },
  { number: 27, name: 'Bamba Dieng', position: 'FW', age: 26, club: 'Lorient' },
  { number: 28, name: 'Ibrahim Mbaye', position: 'FW', age: 18, club: 'Paris Saint-Germain' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 22, 3, 4, 13, 8, 10, 17, 7, 19, 11]
};
