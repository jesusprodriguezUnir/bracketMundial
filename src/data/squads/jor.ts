import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Yazeed Abulaila', position: 'GK', age: 33, club: 'Al-Hussein' },
  { number: 12, name: 'Abdullah Al-Fakhouri', position: 'GK', age: 27, club: 'Al-Wehdat' },
  { number: 23, name: 'Ahmed Abdel Sattar', position: 'GK', age: 31, club: 'Al-Faisaly' },
  { number: 2, name: 'Ehsan Haddad', position: 'DF', age: 32, club: 'Al-Faisaly' },
  { number: 3, name: 'Abdallah Nasib', position: 'DF', age: 31, club: 'Al-Hussein' },
  { number: 4, name: 'Yazan Al-Arab', position: 'DF', age: 29, club: 'Al-Shorta' },
  { number: 5, name: 'Mohannad Abu Taha', position: 'DF', age: 24, club: 'Al-Hussein' },
  { number: 13, name: 'Salem Al-Ajalin', position: 'DF', age: 31, club: 'Al-Faisaly' },
  { number: 14, name: 'Bara Marei', position: 'DF', age: 31, club: 'Al-Wahda' },
  { number: 15, name: 'Abu Jalboush Nour Al-Rawabdeh', position: 'DF', age: 28, club: 'Selangor' },
  { number: 6, name: 'Nizar Al-Rashdan', position: 'MF', age: 27, club: 'Al-Arabi' },
  { number: 8, name: 'Noor Al-Rawabdeh', position: 'MF', age: 28, club: 'Selangor' },
  { number: 10, name: 'Mousa Al-Taamari', position: 'MF', age: 29, club: 'Rennes', captain: true },
  { number: 16, name: 'Mahmoud Al-Mardi', position: 'MF', age: 32, club: 'Al-Hussein' },
  { number: 17, name: 'Ibrahim Sadeh', position: 'MF', age: 25, club: 'Al-Wehdat' },
  { number: 18, name: 'Ali Olwan', position: 'MF', age: 25, club: 'Selangor' },
  { number: 7, name: 'Yazan Al-Naimat', position: 'FW', age: 26, club: 'Al-Arabi' },
  { number: 9, name: 'Hamza Al-Dardour', position: 'FW', age: 35, club: 'Al-Ramtha' },
  { number: 11, name: 'Anas Al-Awadat', position: 'FW', age: 26, club: 'Al-Wehdat' },
  { number: 19, name: 'Mahmoud Ereimat', position: 'FW', age: 22, club: 'Al-Hussein' },
  { number: 20, name: 'Baha Faisal', position: 'FW', age: 28, club: 'Al-Shamal' },
  { number: 21, name: 'Mohammad Abu Zrayq', position: 'FW', age: 28, club: 'Al-Ahli' },
  { number: 22, name: 'Sharara', position: 'FW', age: 27, club: 'Al-Faisaly' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 3, 4, 13, 8, 6, 16, 10, 18, 7]
};