import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Meshaal Barsham',        position: 'GK', age: 27, club: 'Al Sadd' },
  { number: 21, name: 'Yousuf Hassan',          position: 'GK', age: 27, club: 'Al Arabi' },
  { number: 23, name: 'Mahmoud Abou Zaid',      position: 'GK', age: 30, club: 'Al Rayyan' },
  { number: 2,  name: 'Pedro Miguel',           position: 'DF', age: 33, club: 'Al Sadd' },
  { number: 3,  name: 'Bassam Al-Rawi',         position: 'DF', age: 27, club: 'Al Sadd' },
  { number: 4,  name: 'Boualem Khoukhi',        position: 'DF', age: 34, club: 'Al Sadd' },
  { number: 5,  name: 'Tarek Salman',           position: 'DF', age: 30, club: 'Al Gharafa' },
  { number: 14, name: 'Homam El-Amin',          position: 'DF', age: 24, club: 'Al Sadd' },
  { number: 22, name: 'Khalid Balal',           position: 'DF', age: 27, club: 'Al Khor' },
  { number: 6,  name: 'Abdulaziz Hatem',        position: 'MF', age: 31, club: 'Al Rayyan' },
  { number: 8,  name: 'Karim Boudiaf',          position: 'MF', age: 33, club: 'Al Duhail', captain: true },
  { number: 10, name: 'Hassan Al-Haydos',       position: 'MF', age: 33, club: 'Al Sadd' },
  { number: 15, name: 'Mohammed Waad',          position: 'MF', age: 24, club: 'Al Arabi' },
  { number: 16, name: 'Ali Asadalla',           position: 'MF', age: 31, club: 'Al Sadd' },
  { number: 17, name: 'Khaled Mohammed',        position: 'MF', age: 26, club: 'Al Gharafa' },
  { number: 18, name: 'Salem Al-Hajri',         position: 'MF', age: 26, club: 'Al Shamal' },
  { number: 7,  name: 'Akram Afif',             position: 'FW', age: 27, club: 'Al Sadd' },
  { number: 9,  name: 'Almoez Ali',             position: 'FW', age: 28, club: 'Al Duhail' },
  { number: 11, name: 'Mohammed Muntari',       position: 'FW', age: 30, club: 'Al Duhail' },
  { number: 19, name: 'Ismail Mohamad',         position: 'FW', age: 25, club: 'Al Shamal' },
  { number: 20, name: 'Yousuf Abdurisag',       position: 'FW', age: 24, club: 'Al Rayyan' },
  { number: 24, name: 'Yosef Hassan',           position: 'FW', age: 22, club: 'Al Khor' },
];

export const lineup = {
  formation: '5-3-2',
  startingXI: [1, 2, 3, 4, 5, 14, 8, 6, 10, 7, 9]
};

