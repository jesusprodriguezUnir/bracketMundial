import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Mohamed El-Shenawy', position: 'GK', age: 37, club: 'Al Ahly', captain: true },
  { number: 16, name: 'El Mahdy Soliman', position: 'GK', age: 38, club: 'Zamalek' },
  { number: 23, name: 'Mostafa ‘Oufa’ Shobeir', position: 'GK', age: 26, club: 'Al Ahly' },
  { number: 26, name: 'Mohamed Alaa', position: 'GK', age: 27, club: 'El Gouna' },
  // Defensores
  { number: 2, name: 'Yasser Ibrahim', position: 'DF', age: 32, club: 'Al Ahly' },
  { number: 3, name: 'Mohamed Hany', position: 'DF', age: 30, club: 'Al Ahly' },
  { number: 4, name: 'Hossam Abdelmaguid', position: 'DF', age: 27, club: 'Zamalek' },
  { number: 5, name: 'Ramy Rabia', position: 'DF', age: 32, club: 'Al Ain' },
  { number: 6, name: 'Mohamed Abdelmonem', position: 'DF', age: 27, club: 'Nice' },
  { number: 13, name: 'Ahmed Fatouh', position: 'DF', age: 27, club: 'Zamalek' },
  { number: 15, name: 'Karim Hafez', position: 'DF', age: 29, club: 'Pyramids FC' },
  { number: 24, name: 'Tarek Alaa', position: 'DF', age: 24, club: 'Pyramids FC' },
  // Volantes
  { number: 8, name: 'Emam Ashour', position: 'MF', age: 28, club: 'Al Ahly' },
  { number: 11, name: 'Mostafa Ziko', position: 'MF', age: 26, club: 'Pyramids FC' },
  { number: 14, name: 'Hamdy Fathy', position: 'MF', age: 31, club: 'Al-Wakrah' },
  { number: 17, name: 'Mohanad Lasheen', position: 'MF', age: 27, club: 'Pyramids FC' },
  { number: 18, name: 'Nabil \'Dunga\' Emad', position: 'MF', age: 30, club: 'Al-Najma' },
  { number: 19, name: 'Marwan Attia', position: 'MF', age: 28, club: 'Al Ahly' },
  { number: 21, name: 'Mahmoud Saber', position: 'MF', age: 24, club: 'Pyramids FC' },
  // Delanteros
  { number: 7, name: 'Mahmoud Hassan ‘Trezeguet’', position: 'FW', age: 32, club: 'Al Ahly' },
  { number: 9, name: 'Hamza Abdelkarim', position: 'FW', age: 18, club: 'Al Ahly' },
  { number: 10, name: 'Mohamed Salah', position: 'FW', age: 34, club: 'Liverpool' },
  { number: 12, name: 'Haissem Hassan', position: 'FW', age: 23, club: 'Real Oviedo' },
  { number: 20, name: 'Ibrahim Adel', position: 'FW', age: 25, club: 'FC Nordsjælland' },
  { number: 22, name: 'Omar Marmoush', position: 'FW', age: 26, club: 'Manchester City' },
  { number: 25, name: 'Ahmed Sayed ‘Zizo’', position: 'FW', age: 29, club: 'Al Ahly' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 3, 6, 2, 13, 19, 8, 25, 10, 22, 7]
};
