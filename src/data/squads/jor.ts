import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Yazeed Abulaila', position: 'GK', age: 32, club: 'Al-Hussien' },
  { number: 12, name: 'Nour Bani Attiah', position: 'GK', age: 33, club: 'Al-Faisaly' },
  { number: 22, name: 'Abdallah Al Fakhouri', position: 'GK', age: 26, club: 'Al-Wehdat' },
  // Defensores
  { number: 2, name: 'Mohammad Abu Hashish', position: 'DF', age: 30, club: 'Al-Karma' },
  { number: 3, name: 'Abdallah Nasib', position: 'DF', age: 32, club: 'Al-Zawraa' },
  { number: 4, name: 'Husam Abu Dahab', position: 'DF', age: 26, club: 'Al-Faisaly' },
  { number: 5, name: 'Yazan Al Arab', position: 'DF', age: 30, club: 'FC Seoul' },
  { number: 16, name: 'Mohammad Abualnadi', position: 'DF', age: 24, club: 'Selangor' },
  { number: 17, name: 'Salim Obaid', position: 'DF', age: 0, club: 'Al-Hussein' },
  { number: 19, name: 'Saed Al-Rosan', position: 'DF', age: 29, club: 'Al-Hussein' },
  { number: 20, name: 'Mohannad Abu Taha', position: 'DF', age: 23, club: 'Al-Quwa Al-Jawiya' },
  { number: 23, name: 'Ehsan Haddad', position: 'DF', age: 32, club: 'Al-Hussein' },
  { number: 26, name: 'Anas Badawi', position: 'DF', age: 28, club: 'Al-Faisaly' },
  // Volantes
  { number: 6, name: 'Amer Jamous', position: 'MF', age: 24, club: 'Al-Zawraa' },
  { number: 8, name: 'Noor Al-Rawabdeh', position: 'MF', age: 29, club: 'Selangor' },
  { number: 14, name: 'Rajaei Ayed', position: 'MF', age: 32, club: 'Al-Hussein SC' },
  { number: 15, name: 'Ibrahim Sadeh', position: 'MF', age: 26, club: 'Al-Karma' },
  { number: 21, name: 'Nizar Al-Rashdan', position: 'MF', age: 27, club: 'Qatar SC' },
  { number: 25, name: 'Mohammad Al-Dawoud', position: 'MF', age: 34, club: 'Al-Wehdat' },
  // Delanteros
  { number: 7, name: 'Mohammad Abu Zrayq', position: 'FW', age: 28, club: 'Raja Club Athletic' },
  { number: 9, name: 'Ali Olwan', position: 'FW', age: 26, club: 'Al-Sailiya' },
  { number: 10, name: 'Musa Al-Taamari', position: 'FW', age: 28, club: 'Rennes', captain: true },
  { number: 11, name: 'Odeh Al-Fakhouri', position: 'FW', age: 20, club: 'Pyramids' },
  { number: 13, name: 'Mahmoud Al-Mardi', position: 'FW', age: 33, club: 'Al-Hussein' },
  { number: 18, name: 'Ibrahim Sabra', position: 'FW', age: 20, club: 'Göztepe' },
  { number: 24, name: 'Ali Azaizeh', position: 'FW', age: 22, club: 'Al-Shabab' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 23, 3, 5, 17, 8, 21, 13, 10, 9, 18]
};
