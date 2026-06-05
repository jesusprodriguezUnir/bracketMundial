import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Luca Zidane', position: 'GK', age: 28, club: 'Granada CF' },
  { number: 12, name: 'Oussama Benbot', position: 'GK', age: 31, club: 'USM Alger' },
  { number: 16, name: 'Anthony Mandrea', position: 'GK', age: 29, club: 'SM Caen' },

  { number: 2, name: 'Aïssa Mandi', position: 'DF', age: 35, club: 'Lille OSC', captain: true },
  { number: 3, name: 'Rayan Aït-Nouri', position: 'DF', age: 25, club: 'Manchester City' },
  { number: 4, name: 'Mohamed Amine Tougaï', position: 'DF', age: 26, club: 'Espérance de Tunis' },
  { number: 5, name: 'Rafiq Belghali', position: 'DF', age: 24, club: 'Hellas Verona' },
  { number: 13, name: 'Jaouen Hadjam', position: 'DF', age: 23, club: 'Young Boys' },
  { number: 14, name: 'Mehdi Dorval', position: 'DF', age: 25, club: 'SSC Bari' },
  { number: 15, name: 'Ramy Bensebaïni', position: 'DF', age: 31, club: 'Borussia Dortmund' },
  { number: 24, name: 'Zineddine Belaïd', position: 'DF', age: 27, club: 'JS Kabylie' },
  { number: 25, name: 'Youcef Atal', position: 'DF', age: 30, club: 'Al-Sadd SC' },

  { number: 6, name: 'Farès Chaïbi', position: 'MF', age: 23, club: 'Eintracht Frankfurt' },
  { number: 8, name: 'Ramiz Zerrouki', position: 'MF', age: 28, club: 'FC Twente' },
  { number: 10, name: 'Houssem Aouar', position: 'MF', age: 28, club: 'Al Ittihad' },
  { number: 17, name: 'Hicham Boudaoui', position: 'MF', age: 26, club: 'OGC Nice' },
  { number: 18, name: 'Ismaël Bennacer', position: 'MF', age: 28, club: 'Dinamo Zagreb' },
  { number: 23, name: 'Ahmed Kendouci', position: 'MF', age: 26, club: 'Ceramica Cleopatra' },
  { number: 26, name: 'Ibrahim Maza', position: 'MF', age: 20, club: 'Bayer Leverkusen' },
  { number: 27, name: 'Adam Zorgane', position: 'MF', age: 26, club: 'Union Saint-Gilloise' },

  { number: 7, name: 'Riyad Mahrez', position: 'FW', age: 35, club: 'Al Ahli' },
  { number: 9, name: 'Baghdad Bounedjah', position: 'FW', age: 34, club: 'Al-Shamal' },
  { number: 11, name: 'Amine Gouiri', position: 'FW', age: 26, club: 'Olympique de Marseille' },
  { number: 19, name: 'Adel Boulbina', position: 'FW', age: 23, club: 'Al-Duhail' },
  { number: 20, name: 'Mohamed Amoura', position: 'FW', age: 26, club: 'VfL Wolfsburg' },
  { number: 22, name: 'Anis Hadj Moussa', position: 'FW', age: 24, club: 'Feyenoord' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 5, 2, 4, 3, 6, 8, 10, 7, 9, 11]
};