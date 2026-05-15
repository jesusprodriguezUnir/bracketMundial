import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Mohammed Al-Owais', position: 'GK', age: 35, club: 'Al Hilal' },
  { number: 12, name: 'Nawaf Al-Aqidi', position: 'GK', age: 26, club: 'Al Nassr' },
  { number: 23, name: 'Ahmed Al-Kassar', position: 'GK', age: 34, club: 'Al Qadsiah' },
  { number: 2, name: 'Saud Abdulhamid', position: 'DF', age: 27, club: 'Al Hilal', captain: true },
  { number: 3, name: 'Hassan Kadesh', position: 'DF', age: 33, club: 'Al Ittihad' },
  { number: 4, name: 'Ali Al-Bulaihi', position: 'DF', age: 37, club: 'Al Hilal' },
  { number: 5, name: 'Abdulelah Al-Amri', position: 'DF', age: 29, club: 'Al Nassr' },
  { number: 6, name: 'Saad Al-Mousa', position: 'DF', age: 23, club: 'Al Ettifaq' },
  { number: 13, name: 'Yasser Al-Shahrani', position: 'DF', age: 34, club: 'Al Hilal' },
  { number: 15, name: 'Sultan Al-Ghannam', position: 'DF', age: 31, club: 'Al Nassr' },
  { number: 7, name: 'Salem Al-Dawsari', position: 'MF', age: 35, club: 'Al Hilal' },
  { number: 8, name: 'Abdullah Otayf', position: 'MF', age: 34, club: 'Al Hilal' },
  { number: 10, name: 'Mohammed Kanno', position: 'MF', age: 32, club: 'Al Hilal' },
  { number: 14, name: 'Nasser Al-Dawsari', position: 'MF', age: 28, club: 'Al Hilal' },
  { number: 16, name: 'Firas Al-Buraikan', position: 'MF', age: 26, club: 'Al Ahli' },
  { number: 17, name: 'Ayman Yahya', position: 'MF', age: 25, club: 'Al Nassr' },
  { number: 9, name: 'Saleh Al-Shehri', position: 'FW', age: 33, club: 'Al Ittihad' },
  { number: 11, name: 'Abdulrahman Ghareeb', position: 'FW', age: 29, club: 'Al Nassr' },
  { number: 18, name: 'Marwan Al-Sahafi', position: 'FW', age: 22, club: 'Al Ittihad' },
  { number: 19, name: 'Musab Al-Juwayr', position: 'FW', age: 22, club: 'Al Shabab' },
  { number: 20, name: 'Abdullah Radif', position: 'FW', age: 23, club: 'Al Hilal' },
  { number: 21, name: 'Fahad Al-Muwallad', position: 'FW', age: 31, club: 'Al Shabab' },
  { number: 22, name: 'Turki Al-Ammar', position: 'FW', age: 25, club: 'Al Qadsiah' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 13, 10, 8, 11, 7, 16, 9]
};