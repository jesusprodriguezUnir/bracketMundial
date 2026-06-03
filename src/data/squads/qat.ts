import type { Player } from './index';
export const squad: Player[] = [
  // Porteros
  { number: 1,  name: 'Meshaal Barsham',     position: 'GK', age: 28, club: 'Al Sadd' },
  { number: 21, name: 'Salah Zakaria',       position: 'GK', age: 27, club: 'Al Duhail' },
  { number: 22, name: 'Mahmoud Abunada',     position: 'GK', age: 26, club: 'Al Rayyan' },

  // Defensas
  { number: 2,  name: 'Pedro Miguel',        position: 'DF', age: 35, club: 'Al Sadd' },
  { number: 3,  name: 'Issa Laye',           position: 'DF', age: 27, club: 'Al Arabi' },
  { number: 4,  name: 'Boualem Khoukhi',     position: 'DF', age: 35, club: 'Al Sadd' },
  { number: 5,  name: 'Ayoub Aloui',         position: 'DF', age: 25, club: 'Al Gharafa' },
  { number: 12, name: 'Jassem Gaber',        position: 'DF', age: 24, club: 'Al Rayyan' },
  { number: 13, name: 'Sultan Albrake',      position: 'DF', age: 28, club: 'Al Duhail' },
  { number: 14, name: 'Homam Ahmed',         position: 'DF', age: 26, club: 'Cultural Leonesa' },
  { number: 15, name: 'Lucas Mendes',        position: 'DF', age: 35, club: 'Al Wakrah' },
  { number: 16, name: 'Alhashmi Alhussein',  position: 'DF', age: 24, club: 'Al Arabi' },

  // Centrocampistas
  { number: 6,  name: 'Abdulaziz Hatem',     position: 'MF', age: 35, club: 'Al Rayyan' },
  { number: 8,  name: 'Karim Boudiaf',       position: 'MF', age: 35, club: 'Al Duhail' },
  { number: 17, name: 'Ahmed Alganehi',      position: 'MF', age: 25, club: 'Al Gharafa' },
  { number: 20, name: 'Ahmed Fathy',         position: 'MF', age: 33, club: 'Al Arabi' },
  { number: 23, name: 'Assim Madibo',        position: 'MF', age: 29, club: 'Al Wakrah' },

  // Delanteros
  { number: 7,  name: 'Akram Afif',          position: 'FW', age: 29, club: 'Al Sadd' },
  { number: 9,  name: 'Almoez Ali',          position: 'FW', age: 29, club: 'Al Duhail' },
  { number: 10, name: 'Hassan Alhaydos',     position: 'FW', age: 35, club: 'Al Sadd', captain: true },
  { number: 11, name: 'Mohammed Muntari',    position: 'FW', age: 32, club: 'Al Gharafa' },
  { number: 18, name: 'Mohamed Manai',       position: 'FW', age: 27, club: 'Al Shamal' },
  { number: 19, name: 'Ahmed Alaaeldin',     position: 'FW', age: 33, club: 'Al Rayyan' },
  { number: 24, name: 'Edmilson Junior',     position: 'FW', age: 31, club: 'Al Duhail' },
  { number: 25, name: 'Yusuf Abdurisag',     position: 'FW', age: 26, club: 'Al Wakrah' },
  { number: 26, name: 'Tahsin Jamshid',      position: 'FW', age: 24, club: 'Al Duhail' },
];

export const lineup = {
  formation: '5-3-2',
  startingXI: [1, 2, 3, 4, 5, 14, 8, 6, 10, 7, 9]
};
