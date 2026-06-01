import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Luca Zidane', position: 'GK', age: 28, club: 'Eibar' },
  { number: 12, name: 'Oussama Benbot', position: 'GK', age: 31, club: 'USM Alger' },
  { number: 23, name: 'Melvin Mastil', position: 'GK', age: 23, club: 'Lausanne-Sport' },
  { number: 16, name: 'Abdelatif Ramdane', position: 'GK', age: 25, club: 'MC Alger' },

  { number: 2, name: 'Aïssa Mandi', position: 'DF', age: 35, club: 'Lille', captain: true },
  { number: 3, name: 'Rayan Aït-Nouri', position: 'DF', age: 25, club: 'Wolverhampton' },
  { number: 4, name: 'Mohamed Amine Tougai', position: 'DF', age: 26, club: 'ES Tunis' },
  { number: 5, name: 'Rafik Belghali', position: 'DF', age: 24, club: 'Lommel' },
  { number: 13, name: 'Jaouen Hadjam', position: 'DF', age: 23, club: 'Young Boys' },
  { number: 14, name: 'Samir Chergui', position: 'DF', age: 27, club: 'Paris FC' },
  { number: 15, name: 'Ramy Bensebaïni', position: 'DF', age: 31, club: 'Borussia Dortmund' },
  { number: 24, name: 'Zineddine Belaïd', position: 'DF', age: 27, club: 'Sint-Truiden' },
  { number: 25, name: 'Achref Abada', position: 'DF', age: 26, club: 'ES Mostaganem' },

  { number: 6, name: 'Farès Chaïbi', position: 'MF', age: 23, club: 'Eintracht Frankfurt' },
  { number: 8, name: 'Ramiz Zerrouki', position: 'MF', age: 28, club: 'Feyenoord' },
  { number: 10, name: 'Houssem Aouar', position: 'MF', age: 28, club: 'Al Ittihad' },
  { number: 17, name: 'Hicham Boudaoui', position: 'MF', age: 26, club: 'Nice' },
  { number: 18, name: 'Nabil Bentaleb', position: 'MF', age: 31, club: 'Lille' },
  { number: 26, name: 'Ibrahim Maza', position: 'MF', age: 20, club: 'Hertha BSC' },
  { number: 27, name: 'Yacine Titraoui', position: 'MF', age: 22, club: 'Charleroi' },

  { number: 7, name: 'Riyad Mahrez', position: 'FW', age: 35, club: 'Al Ahli' },
  { number: 9, name: 'Nadhir Benbouali', position: 'FW', age: 26, club: 'Charleroi' },
  { number: 11, name: 'Amine Gouiri', position: 'FW', age: 26, club: 'Rennes' },
  { number: 19, name: 'Adil Boulbina', position: 'FW', age: 23, club: 'Paradou AC' },
  { number: 20, name: 'Mohamed El Amine Amoura', position: 'FW', age: 26, club: 'Wolfsburg' },
  { number: 21, name: 'Farès Ghedjemis', position: 'FW', age: 24, club: 'Frosinone' },
  { number: 22, name: 'Anis Hadj Moussa', position: 'FW', age: 24, club: 'Feyenoord' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 5, 2, 4, 3, 6, 8, 10, 7, 9, 11]
};