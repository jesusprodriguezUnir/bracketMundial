import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Édouard Mendy', position: 'GK', age: 34, club: 'Al Ahli' },
  { number: 16, name: 'Mory Diaw', position: 'GK', age: 33, club: 'Clermont' },
  { number: 23, name: 'Seny Dieng', position: 'GK', age: 31, club: 'Middlesbrough' },
  { number: 2, name: 'Krépin Diatta', position: 'DF', age: 27, club: 'Monaco' },
  { number: 3, name: 'Kalidou Koulibaly', position: 'DF', age: 35, club: 'Al Hilal', captain: true },
  { number: 4, name: 'Moussa Niakhaté', position: 'DF', age: 30, club: 'Lyon' },
  { number: 5, name: 'Abdou Diallo', position: 'DF', age: 30, club: 'Al-Arabi' },
  { number: 12, name: 'El Hadji Malick Diouf', position: 'DF', age: 22, club: 'Slavia Praha' },
  { number: 14, name: 'Formose Mendy', position: 'DF', age: 24, club: 'Lorient' },
  { number: 15, name: 'Youssouf Sabaly', position: 'DF', age: 33, club: 'Real Betis' },
  { number: 6, name: 'Nampalys Mendy', position: 'MF', age: 34, club: 'Lens' },
  { number: 8, name: 'Pape Matar Sarr', position: 'MF', age: 24, club: 'Tottenham Hotspur' },
  { number: 10, name: 'Lamine Camara', position: 'MF', age: 22, club: 'Monaco' },
  { number: 13, name: 'Pape Gueye', position: 'MF', age: 27, club: 'Villarreal' },
  { number: 17, name: 'Pathé Ciss', position: 'MF', age: 32, club: 'Rayo Vallecano' },
  { number: 18, name: 'Idrissa Gueye', position: 'MF', age: 36, club: 'Everton' },
  { number: 7, name: 'Ismaïla Sarr', position: 'FW', age: 28, club: 'Crystal Palace' },
  { number: 9, name: 'Boulaye Dia', position: 'FW', age: 30, club: 'Lazio' },
  { number: 11, name: 'Sadio Mané', position: 'FW', age: 34, club: 'Al Nassr' },
  { number: 19, name: 'Nicolas Jackson', position: 'FW', age: 25, club: 'Chelsea' },
  { number: 20, name: 'Iliman Ndiaye', position: 'FW', age: 26, club: 'Everton' },
  { number: 21, name: 'Habib Diallo', position: 'FW', age: 31, club: 'Al-Shabab' },
  { number: 22, name: 'Abdallah Sima', position: 'FW', age: 25, club: 'Brest' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 15, 3, 4, 5, 8, 10, 18, 7, 19, 11]
};