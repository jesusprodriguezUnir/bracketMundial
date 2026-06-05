import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Melvin Mastil', position: 'GK', age: 0, club: 'Lausanne-Sport' },
  { number: 16, name: 'Oussama Benbot', position: 'GK', age: 31, club: 'USM Alger' },
  { number: 23, name: 'Luca Zidane', position: 'GK', age: 28, club: 'Granada' },
  // Defensores
  { number: 2, name: 'Aissa Mandi', position: 'DF', age: 35, club: 'Lille', captain: true },
  { number: 3, name: 'Achraf Abada', position: 'DF', age: 0, club: 'USM Alger' },
  { number: 4, name: 'Mohamed Tougai', position: 'DF', age: 26, club: 'Espérance de Tunis' },
  { number: 5, name: 'Zineddine Belaid', position: 'DF', age: 27, club: 'JS Kabylie' },
  { number: 13, name: 'Jaouen Hadjam', position: 'DF', age: 23, club: 'Young Boys' },
  { number: 15, name: 'Rayan Aït-Nouri', position: 'DF', age: 25, club: 'Manchester City' },
  { number: 17, name: 'Rafik Belghali', position: 'DF', age: 23, club: 'Verona' },
  { number: 21, name: 'Ramy Bensebaini', position: 'DF', age: 31, club: 'Borussia Dortmund' },
  { number: 26, name: 'Samir Chergui', position: 'DF', age: 27, club: 'Paris FC' },
  // Volantes
  { number: 6, name: 'Ramiz Zerrouki', position: 'MF', age: 28, club: 'Feyenoord' },
  { number: 8, name: 'Houssem Aouar', position: 'MF', age: 28, club: 'Al-Ittihad' },
  { number: 10, name: 'Farès Chaïbi', position: 'MF', age: 23, club: 'Eintracht Frankfurt' },
  { number: 14, name: 'Hicham Boudaoui', position: 'MF', age: 26, club: 'Nice' },
  { number: 19, name: 'Nabil Bentaleb', position: 'MF', age: 0, club: 'Lille' },
  { number: 22, name: 'Ibrahim Maza', position: 'MF', age: 20, club: 'Bayer Leverkusen' },
  { number: 24, name: 'Yacine Titraoui', position: 'MF', age: 0, club: 'Royal Charleroi' },
  // Delanteros
  { number: 7, name: 'Riyad Mahrez', position: 'FW', age: 35, club: 'Al-Ahli' },
  { number: 9, name: 'Amine Gouiri', position: 'FW', age: 26, club: 'Marseille' },
  { number: 11, name: 'Anis Hadj Moussa', position: 'FW', age: 23, club: 'Feyenoord' },
  { number: 12, name: 'Nadhir Benbouali', position: 'FW', age: 0, club: 'Eto FC' },
  { number: 18, name: 'Mohamed Amine Amoura', position: 'FW', age: 25, club: 'Wolfsburg' },
  { number: 20, name: 'Adil Boulbina', position: 'FW', age: 23, club: 'Al-Duhail' },
  { number: 25, name: 'Farès Ghedjemis', position: 'FW', age: 24, club: 'Frosinone' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [23, 17, 2, 18, 15, 10, 6, 8, 7, 11, 9]
};
