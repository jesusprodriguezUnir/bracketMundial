import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Yazeed Abulaila', position: 'GK', age: 33, club: 'Al Hussein' },
  { number: 12, name: 'Abdallah Al Fakhouri', position: 'GK', age: 26, club: 'Al Wehdat' },
  { number: 22, name: 'Nour Bani Attiah', position: 'GK', age: 33, club: 'Al Faisaly' },

  { number: 2, name: 'Ehsan Haddad', position: 'DF', age: 32, club: 'Al Hussein' },
  { number: 3, name: 'Abdallah Nasib', position: 'DF', age: 32, club: 'Al Zawraa' },
  { number: 4, name: 'Yazan Al Arab', position: 'DF', age: 30, club: 'FC Seoul' },
  { number: 13, name: 'Yousef Abu Al Jazar', position: 'DF', age: 26, club: 'Al Hussein' },
  { number: 14, name: 'Husam Abu Dahab', position: 'DF', age: 26, club: 'Al Faisaly' },
  { number: 15, name: 'Mohammad Abu Hashish', position: 'DF', age: 31, club: 'Al Karma' },
  { number: 23, name: 'Mohammad Abualnadi', position: 'DF', age: 25, club: 'Selangor' },
  { number: 24, name: 'Saad Al Rousan', position: 'DF', age: 29, club: 'Al Hussein' },
  { number: 25, name: 'Ahmad Assaf', position: 'DF', age: 26, club: 'Al Hussein' },

  { number: 5, name: 'Mohannad Abu Taha', position: 'MF', age: 23, club: 'Al Quwa Al Jawiya' },
  { number: 6, name: 'Nizar Al Rashdan', position: 'MF', age: 27, club: 'Qatar SC' },
  { number: 8, name: 'Noor Al Rawabdeh', position: 'MF', age: 29, club: 'Selangor' },
  { number: 17, name: 'Ibrahim Saadeh', position: 'MF', age: 26, club: 'Al Karma' },
  { number: 19, name: 'Issam Smeeri', position: 'MF', age: 26, club: 'Al Salt' },
  { number: 26, name: 'Amer Jamous', position: 'MF', age: 23, club: 'Al Zawraa' },

  { number: 7, name: 'Yazan Al Naimat', position: 'FW', age: 26, club: 'Al Arabi' },
  { number: 9, name: 'Tammer Bany Odeh', position: 'FW', age: 22, club: 'West Brom' },
  { number: 10, name: 'Mousa Al Tamari', position: 'FW', age: 28, club: 'Rennes', captain: true },
  { number: 11, name: 'Ibrahim Sabra', position: 'FW', age: 20, club: 'Lokomotiva Zagreb' },
  { number: 16, name: 'Mahmoud Al Mardi', position: 'FW', age: 32, club: 'Al Hussein' },
  { number: 18, name: 'Ali Olwan', position: 'FW', age: 26, club: 'Al Sailiya' },
  { number: 20, name: 'Bahaa Faisal', position: 'FW', age: 30, club: 'Al Waab' },
  { number: 21, name: 'Mohammad Abu Zrayq', position: 'FW', age: 28, club: 'Raja' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 3, 4, 13, 8, 6, 16, 10, 18, 7]
};