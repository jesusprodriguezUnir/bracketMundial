import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Nawaf Al-Aqidi', position: 'GK', age: 25, club: 'Al-Nassr' },
  { number: 21, name: 'Mohammed Al-Owais', position: 'GK', age: 34, club: 'Al-Ula' },
  { number: 22, name: 'Ahmed Al-Kassar', position: 'GK', age: 34, club: 'Al-Qadsiah' },
  // Defensores
  { number: 2, name: 'Ali Majrashi', position: 'DF', age: 27, club: 'Al-Ahli' },
  { number: 3, name: 'Ali Lajami', position: 'DF', age: 30, club: 'Al-Hilal' },
  { number: 4, name: 'Abdulelah Al-Amri', position: 'DF', age: 29, club: 'Al-Nassr' },
  { number: 5, name: 'Hassan Al-Tambakti', position: 'DF', age: 26, club: 'Al-Hilal' },
  { number: 12, name: 'Saud Abdulhamid', position: 'DF', age: 27, club: 'Lens', captain: true },
  { number: 13, name: 'Nawaf Boushal', position: 'DF', age: 26, club: 'Al-Nassr' },
  { number: 14, name: 'Hassan Kadesh', position: 'DF', age: 33, club: 'Al-Ittihad' },
  { number: 24, name: 'Moteb Al-Harbi', position: 'DF', age: 26, club: 'Al-Hilal' },
  { number: 25, name: 'Jehad Thakri', position: 'DF', age: 24, club: 'Al-Qadsiah' },
  { number: 26, name: 'Mohammed Abu Al-Shamat', position: 'DF', age: 23, club: 'Al-Qadsiah' },
  // Volantes
  { number: 6, name: 'Nasser Al-Dawsari', position: 'MF', age: 28, club: 'Al-Hilal' },
  { number: 7, name: 'Musab Al-Juwayr', position: 'MF', age: 22, club: 'Al-Qadsiah' },
  { number: 8, name: 'Ayman Yahya', position: 'MF', age: 25, club: 'Al-Nassr' },
  { number: 15, name: 'Abdullah Al-Khaibari', position: 'MF', age: 29, club: 'Al-Nassr' },
  { number: 16, name: 'Ziyad Al-Johani', position: 'MF', age: 24, club: 'Al-Ahli' },
  { number: 17, name: 'Khalid Al-Ghannam', position: 'MF', age: 25, club: 'Al-Ettifaq' },
  { number: 18, name: 'Alaa Al-Hejji', position: 'MF', age: 31, club: 'Neom' },
  { number: 23, name: 'Mohamed Kanno', position: 'MF', age: 32, club: 'Al-Hilal' },
  // Delanteros
  { number: 9, name: 'Firas Al-Buraikan', position: 'FW', age: 26, club: 'Al-Ahli' },
  { number: 10, name: 'Salem Al-Dawsari', position: 'FW', age: 35, club: 'Al-Hilal' },
  { number: 11, name: 'Saleh Al-Shehri', position: 'FW', age: 33, club: 'Al-Ittihad' },
  { number: 19, name: 'Abdullah Al-Hamdan', position: 'FW', age: 26, club: 'Al-Nassr' },
  { number: 20, name: 'Sultan Mandash', position: 'FW', age: 31, club: 'Al-Hilal' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [21, 12, 5, 4, 24, 23, 15, 17, 10, 9, 11]
};
