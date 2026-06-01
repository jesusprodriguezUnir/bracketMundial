import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Jalal Hassan', position: 'GK', age: 35, club: 'Al-Zawraa', captain: true },
  { number: 12, name: 'Ahmed Basil', position: 'GK', age: 29, club: 'Al-Shorta' },
  { number: 23, name: 'Fahad Talib', position: 'GK', age: 31, club: 'Al-Qasim' },
  
  { number: 2, name: 'Rebin Sulaka', position: 'DF', age: 33, club: 'Erbil' },
  { number: 3, name: 'Manaf Younis', position: 'DF', age: 29, club: 'Al-Shorta' },
  { number: 4, name: 'Frans Dhia Putros', position: 'DF', age: 32, club: 'Port FC' },
  { number: 5, name: 'Zaid Tahseen', position: 'DF', age: 24, club: 'Al-Quwa Al-Jawiya' },
  { number: 6, name: 'Ahmed Yahya', position: 'DF', age: 28, club: 'Al-Shorta' },
  { number: 14, name: 'Hussein Ali', position: 'DF', age: 24, club: 'SC Heerenveen' },
  { number: 15, name: 'Akam Hashem', position: 'DF', age: 27, club: 'Erbil' },
  { number: 22, name: 'Merchas Doski', position: 'DF', age: 26, club: 'Slovácko' },

  { number: 8, name: 'Amir Al-Ammari', position: 'MF', age: 28, club: 'Halmstad' },
  { number: 10, name: 'Ali Jasim', position: 'MF', age: 22, club: 'Como' },
  { number: 11, name: 'Zaid Ismail', position: 'MF', age: 22, club: 'Al-Shorta' },
  { number: 13, name: 'Kevin Yakob', position: 'MF', age: 25, club: 'AGF' },
  { number: 16, name: 'Zidane Iqbal', position: 'MF', age: 23, club: 'Utrecht' },
  { number: 18, name: 'Ibrahim Bayesh', position: 'MF', age: 25, club: 'Al-Riyadh' },
  { number: 20, name: 'Aimar Sher', position: 'MF', age: 23, club: 'Sarpsborg 08' },
  { number: 21, name: 'Mustafa Saadoon', position: 'MF', age: 24, club: 'Al-Quwa Al-Jawiya' },
  { number: 24, name: 'Ahmed Qasim', position: 'MF', age: 21, club: 'Erbil' },
  { number: 25, name: 'Marko Farji', position: 'MF', age: 22, club: 'Strømsgodset' },

  { number: 7, name: 'Youssef Amyn', position: 'FW', age: 23, club: 'Eintracht Braunschweig' },
  { number: 9, name: 'Mohanad Ali', position: 'FW', age: 25, club: 'Al-Shorta' },
  { number: 17, name: 'Aymen Hussein', position: 'FW', age: 30, club: 'Al-Wakrah' },
  { number: 19, name: 'Ali Al-Hamadi', position: 'FW', age: 24, club: 'Ipswich Town' },
  { number: 26, name: 'Ali Yousef', position: 'FW', age: 29, club: 'Al-Zawraa' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 14, 2, 3, 22, 8, 16, 18, 10, 17, 19]
};