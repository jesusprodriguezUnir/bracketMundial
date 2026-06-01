import type { Player } from './index';

export const squad: Player[] = [
  // Goalkeepers
  { number: 1, name: 'Mohammed Al-Owais', position: 'GK', age: 35, club: 'Al Hilal' },
  { number: 12, name: 'Nawaf Al-Aqidi', position: 'GK', age: 26, club: 'Al Nassr' },
  { number: 23, name: 'Ahmed Al-Kassar', position: 'GK', age: 34, club: 'Al Qadsiah' },

  // Defenders
  { number: 2, name: 'Saud Abdulhamid', position: 'DF', age: 27, club: 'Al Hilal', captain: true },
  { number: 3, name: 'Hassan Kadesh', position: 'DF', age: 33, club: 'Al Ittihad' },
  { number: 4, name: 'Hassan Tambakti', position: 'DF', age: 27, club: 'Al Hilal' },
  { number: 5, name: 'Abdulelah Al-Amri', position: 'DF', age: 29, club: 'Al Nassr' },
  { number: 6, name: 'Jehad Thikri', position: 'DF', age: 24, club: 'Al Qadsiah' },
  { number: 13, name: 'Moteb Al-Harbi', position: 'DF', age: 26, club: 'Al Hilal' },
  { number: 15, name: 'Ali Majrashi', position: 'DF', age: 26, club: 'Al Ahli' },
  { number: 21, name: 'Nawaf Boushal', position: 'DF', age: 26, club: 'Al Nassr' },
  { number: 24, name: 'Ali Lajami', position: 'DF', age: 30, club: 'Al Nassr' },
  { number: 25, name: 'Mohammed Abu Al-Shamat', position: 'DF', age: 23, club: 'Al Qadsiah' },

  // Midfielders
  { number: 7, name: 'Salem Al-Dawsari', position: 'MF', age: 35, club: 'Al Hilal' },
  { number: 8, name: 'Abdullah Al-Khaibari', position: 'MF', age: 29, club: 'Al Nassr' },
  { number: 10, name: 'Mohammed Kanno', position: 'MF', age: 32, club: 'Al Hilal' },
  { number: 11, name: 'Khalid Al-Ghannam', position: 'MF', age: 25, club: 'Al Ettifaq' },
  { number: 14, name: 'Nasser Al-Dawsari', position: 'MF', age: 28, club: 'Al Hilal' },
  { number: 16, name: 'Firas Al-Buraikan', position: 'MF', age: 26, club: 'Al Ahli' },
  { number: 17, name: 'Ayman Yahya', position: 'MF', age: 25, club: 'Al Nassr' },
  { number: 19, name: 'Musab Al-Juwayr', position: 'MF', age: 22, club: 'Al Shabab' },
  { number: 20, name: 'Sultan Mandash', position: 'MF', age: 31, club: 'Al Taawoun' },
  { number: 22, name: 'Ziyad Al-Johani', position: 'MF', age: 24, club: 'Al Ahli' },
  { number: 26, name: 'Alaa Al-Hajji', position: 'MF', age: 30, club: 'Al Wehda' },

  // Forwards
  { number: 9, name: 'Saleh Al-Shehri', position: 'FW', age: 33, club: 'Al Ittihad' },
  { number: 18, name: 'Abdullah Al-Hamdan', position: 'FW', age: 26, club: 'Al Hilal' }
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 13, 10, 8, 11, 7, 16, 9]
};