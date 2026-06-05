import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Fahad Talib', position: 'GK', age: 31, club: 'Al-Talaba' },
  { number: 12, name: 'Jalal Hassan', position: 'GK', age: 35, club: 'Al-Zawraa', captain: true },
  { number: 22, name: 'Ahmed Basil', position: 'GK', age: 29, club: 'Al-Shorta' },
  // Defensores
  { number: 2, name: 'Rebin Sulaka', position: 'DF', age: 33, club: 'FC Port' },
  { number: 3, name: 'Hussein Ali', position: 'DF', age: 24, club: 'Pogon Szczecin' },
  { number: 4, name: 'Zaid Tahseen', position: 'DF', age: 24, club: 'Pakhtakor FC' },
  { number: 5, name: 'Akam Hashem', position: 'DF', age: 27, club: 'Al-Zawraa' },
  { number: 6, name: 'Manaf Younis', position: 'DF', age: 29, club: 'Al-Shorta' },
  { number: 15, name: 'Ahmed Yahya', position: 'DF', age: 31, club: 'Al-Shorta' },
  { number: 23, name: 'Merchas Doski', position: 'DF', age: 26, club: 'Viktoria Plzen' },
  { number: 25, name: 'Mustafa Saadoon', position: 'DF', age: 24, club: 'Al-Shorta' },
  { number: 26, name: 'Frans Putros', position: 'DF', age: 32, club: 'Persib Bandung' },
  // Volantes
  { number: 7, name: 'Youssef Amyn', position: 'MF', age: 23, club: 'AEK Larnaca' },
  { number: 8, name: 'Ibrahim Bayesh', position: 'MF', age: 26, club: 'Al-Dhafra' },
  { number: 11, name: 'Ahmed Qasim', position: 'MF', age: 22, club: 'Nashville' },
  { number: 14, name: 'Zidane Iqbal', position: 'MF', age: 23, club: 'Utrectht' },
  { number: 16, name: 'Amir Al-Ammari', position: 'MF', age: 28, club: 'Cracovia' },
  { number: 19, name: 'Kevin Yakob', position: 'MF', age: 25, club: 'AGF' },
  { number: 20, name: 'Aimar Sher', position: 'MF', age: 23, club: 'Sarpsborg' },
  { number: 24, name: 'Zaid Ismail', position: 'MF', age: 24, club: 'Al-Talaba' },
  // Delanteros
  { number: 9, name: 'Ali Al-Hamadi', position: 'FW', age: 24, club: 'Ipswich' },
  { number: 10, name: 'Mohanad Ali', position: 'FW', age: 25, club: 'Dibba' },
  { number: 13, name: 'Ali Yousef', position: 'FW', age: 29, club: 'Al-Talaba' },
  { number: 17, name: 'Ali Jassim', position: 'FW', age: 22, club: 'Como' },
  { number: 18, name: 'Aymen Hussein', position: 'FW', age: 30, club: 'Al-Karma' },
  { number: 21, name: 'Marko Farji', position: 'FW', age: 22, club: 'Venezia' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [12, 3, 2, 6, 23, 16, 14, 8, 17, 18, 9]
};
