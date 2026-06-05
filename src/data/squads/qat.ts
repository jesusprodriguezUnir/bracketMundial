import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Mahmoud Abunada', position: 'GK', age: 26, club: 'Al-Rayyan' },
  { number: 21, name: 'Salah Zakaria', position: 'GK', age: 27, club: 'Al-Duhail' },
  { number: 22, name: 'Meshaal Barsham', position: 'GK', age: 28, club: 'Al-Sadd' },
  // Defensores
  { number: 2, name: 'Pedro Miguel', position: 'DF', age: 36, club: 'Al-Sadd' },
  { number: 3, name: 'Lucas Mendes', position: 'DF', age: 36, club: 'Al-Wakrah' },
  { number: 4, name: 'Issa Laye', position: 'DF', age: 27, club: 'Al-Arabi' },
  { number: 13, name: 'Ayoub Alawi', position: 'DF', age: 20, club: 'Al-Gharafa' },
  { number: 14, name: 'Homam Ahmed', position: 'DF', age: 26, club: 'Cultural Leonesa' },
  { number: 16, name: 'Boualem Khoukhi', position: 'DF', age: 35, club: 'Al-Sadd' },
  { number: 18, name: 'Sultan Al-Brake', position: 'DF', age: 29, club: 'Al-Duhail' },
  { number: 25, name: 'Hashmi Hussein', position: 'DF', age: 24, club: 'Al-Arabi' },
  // Volantes
  { number: 5, name: 'Jassem Gaber', position: 'MF', age: 24, club: 'Al-Rayyan' },
  { number: 6, name: 'Abdulaziz Hatem', position: 'MF', age: 35, club: 'Al-Rayyan' },
  { number: 12, name: 'Karim Boudiaf', position: 'MF', age: 35, club: 'Al-Duhail' },
  { number: 20, name: 'Ahmed Fathy', position: 'MF', age: 33, club: 'Al-Arabi' },
  { number: 23, name: 'Assim Madibo', position: 'MF', age: 29, club: 'Al-Wakrah' },
  { number: 26, name: 'Mohamed Al-Mannai', position: 'MF', age: 27, club: 'Al-Shamal' },
  // Delanteros
  { number: 7, name: 'Ahmed Alaaeldin', position: 'FW', age: 33, club: 'Al-Rayyan' },
  { number: 8, name: 'Edmilson Junior', position: 'FW', age: 31, club: 'Al-Duhail' },
  { number: 9, name: 'Mohammed Muntari', position: 'FW', age: 32, club: 'Al-Gharafa' },
  { number: 10, name: 'Hassan Al-Haydos', position: 'FW', age: 35, club: 'Al-Sadd', captain: true },
  { number: 11, name: 'Akram Afif', position: 'FW', age: 29, club: 'Al-Sadd' },
  { number: 15, name: 'Yusuf Abdurisag', position: 'FW', age: 27, club: 'Al-Wakrah' },
  { number: 17, name: 'Ahmed Al-Ganehi', position: 'FW', age: 25, club: 'Al-Gharafa' },
  { number: 19, name: 'Almoez Ali', position: 'FW', age: 29, club: 'Al-Duhail' },
  { number: 24, name: 'Tahsin Mohammed Jamshid', position: 'FW', age: 24, club: 'Al-Duhail SC' },
];

export const lineup = {
  formation: '5-3-2',
  startingXI: [22, 2, 4, 16, 13, 14, 12, 6, 10, 11, 19]
};
