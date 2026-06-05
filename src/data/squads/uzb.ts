import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Utkir Yusupov', position: 'GK', age: 35, club: 'Navbakhor' },
  { number: 12, name: 'Abduvokhid Nematov', position: 'GK', age: 24, club: 'Nasaf' },
  { number: 16, name: 'Botirali Ergashev', position: 'GK', age: 30, club: 'Neftchi' },
  // Defensores
  { number: 2, name: 'Abdukodir Khusanov', position: 'DF', age: 22, club: 'Manchester City' },
  { number: 3, name: 'Khojiakbar Alijonov', position: 'DF', age: 29, club: 'Pakhtakor' },
  { number: 4, name: 'Farrukh Sayfiev', position: 'DF', age: 35, club: 'Neftchi' },
  { number: 5, name: 'Rustam Ashurmatov', position: 'DF', age: 29, club: 'Esteghlal' },
  { number: 13, name: 'Sherzod Nasrullaev', position: 'DF', age: 28, club: 'Pakhtakor' },
  { number: 15, name: 'Umar Eshmurodov', position: 'DF', age: 33, club: 'Nasaf' },
  { number: 18, name: 'Abdulla Abdullaev', position: 'DF', age: 29, club: 'Dibba' },
  { number: 24, name: 'Bekhruz Karimov', position: 'DF', age: 18, club: 'Surkhon' },
  { number: 25, name: 'Avazbek Ulmasaliev', position: 'DF', age: 26, club: 'Olmaliq' },
  { number: 26, name: 'Jakhongir Urozov', position: 'DF', age: 22, club: 'Dinamo Samarkand' },
  // Volantes
  { number: 6, name: 'Akmal Mozgovoy', position: 'MF', age: 27, club: 'Pakhtakor' },
  { number: 7, name: 'Otabek Shukurov', position: 'MF', age: 30, club: 'Baniyas' },
  { number: 8, name: 'Jamshid Iskanderov', position: 'MF', age: 32, club: 'Neftchi' },
  { number: 9, name: 'Odiljon Khamrobekov', position: 'MF', age: 30, club: 'Tractor' },
  { number: 19, name: 'Azizjon Ganiev', position: 'MF', age: 28, club: 'Al Bataeh' },
  { number: 20, name: 'Azizbek Amonov', position: 'MF', age: 28, club: 'Dinamo Samarkand' },
  { number: 22, name: 'Abbosbek Fayzullaev', position: 'MF', age: 23, club: 'Basaksehir' },
  { number: 23, name: 'Sherzod Esanov', position: 'MF', age: 23, club: 'FC Buxoro' },
  // Delanteros
  { number: 10, name: 'Jaloliddin Masharipov', position: 'FW', age: 33, club: 'Esteghlal' },
  { number: 11, name: 'Oston Urunov', position: 'FW', age: 25, club: 'Persepolis' },
  { number: 14, name: 'Eldor Shomurodov', position: 'FW', age: 31, club: 'Roma', captain: true },
  { number: 17, name: 'Dostonbek Khamdamov', position: 'FW', age: 29, club: 'Pakhtakor' },
  { number: 21, name: 'Igor Sergeev', position: 'FW', age: 32, club: 'Persepolis' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 3, 2, 5, 13, 7, 6, 22, 10, 11, 14]
};
