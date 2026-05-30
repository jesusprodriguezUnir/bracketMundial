import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Mohamed El Shenawy', position: 'GK', age: 37, club: 'Al Ahly', captain: true },
  { number: 16, name: 'Moustafa Shobeir', position: 'GK', age: 26, club: 'Al Ahly' },
  { number: 23, name: 'El Mahdy Soliman', position: 'GK', age: 32, club: 'Al Zamalek' },
  { number: 9, name: 'Mohamed Alaa', position: 'GK', age: 24, club: 'ZED FC' },
  { number: 2, name: 'Tarek Alaa', position: 'DF', age: 27, club: 'ZED FC' },
  { number: 3, name: 'Mohamed Abdelmonem', position: 'DF', age: 27, club: 'OGC Nice' },
  { number: 4, name: 'Ramy Rabia', position: 'DF', age: 32, club: 'Al Ahly' },
  { number: 5, name: 'Mohamed Hany', position: 'DF', age: 30, club: 'Al Ahly' },
  { number: 6, name: 'Ahmed El Fotouh', position: 'DF', age: 27, club: 'Al Zamalek' },
  { number: 7, name: 'Hamdy Fathy', position: 'DF', age: 31, club: 'Al Wakrah' },
  { number: 12, name: 'Yasser Ibrahim', position: 'DF', age: 33, club: 'Al Ahly' },
  { number: 15, name: 'Hossam Abdelmaguid', position: 'DF', age: 27, club: 'Al Zamalek' },
  { number: 22, name: 'Karim Hafez', position: 'DF', age: 29, club: 'Pyramids' },
  { number: 8, name: 'Marwan Attia', position: 'MF', age: 28, club: 'Al Ahly' },
  { number: 13, name: 'Emam Ashour', position: 'MF', age: 28, club: 'Al Ahly' },
  { number: 14, name: 'Haissem Hassan', position: 'MF', age: 24, club: 'Real Oviedo' },
  { number: 17, name: 'Ahmed Sayed Zizo', position: 'MF', age: 30, club: 'Al Zamalek' },
  { number: 19, name: 'Trézéguet', position: 'MF', age: 32, club: 'Al-Rayyan' },
  { number: 20, name: 'Ibrahim Adel', position: 'MF', age: 25, club: 'Pyramids' },
  { number: 21, name: 'Mostafa Ziko', position: 'MF', age: 26, club: 'ZED FC' },
  { number: 24, name: 'Mohanad Lasheen', position: 'MF', age: 27, club: 'Pyramids' },
  { number: 25, name: 'Donga', position: 'MF', age: 28, club: 'Al Zamalek' },
  { number: 26, name: 'Mahmoud Saber', position: 'MF', age: 24, club: 'Pyramids' },
  { number: 10, name: 'Mohamed Salah', position: 'FW', age: 34, club: 'Liverpool' },
  { number: 11, name: 'Omar Marmoush', position: 'FW', age: 27, club: 'Manchester City' },
  { number: 18, name: 'Hamza Abdelkarim', position: 'FW', age: 21, club: 'Barcelona Atlètic' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 5, 3, 12, 6, 8, 13, 17, 10, 11, 19]
};
