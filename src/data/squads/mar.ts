import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Yassine Bounou', position: 'GK', age: 35, club: 'Al-Hilal' },
  { number: 2, name: 'Munir Mohamedi', position: 'GK', age: 37, club: 'Nahdat Berkane' },
  { number: 3, name: 'Ahmed Reda Tagnaouti', position: 'GK', age: 30, club: 'FUS Rabat' },

  // Defensas
  { number: 4, name: 'Achraf Hakimi', position: 'DF', age: 27, club: 'PSG', captain: true },
  { number: 5, name: 'Noussair Mazraoui', position: 'DF', age: 28, club: 'Manchester United' },
  { number: 6, name: 'Nayef Aguerd', position: 'DF', age: 30, club: 'Real Sociedad' },
  { number: 7, name: 'Chadi Riad', position: 'DF', age: 22, club: 'Crystal Palace' },
  { number: 8, name: 'Issa Diop', position: 'DF', age: 29, club: 'Fulham' },
  { number: 9, name: 'Anass Salah-Eddine', position: 'DF', age: 24, club: 'PSV Eindhoven' },
  { number: 10, name: 'Youssef Belammari', position: 'DF', age: 27, club: 'Raja Casablanca' },
  { number: 11, name: 'Redouane Halhal', position: 'DF', age: 23, club: 'Helmond Sport' },
  { number: 12, name: 'Zakaria El Ouahdi', position: 'DF', age: 24, club: 'Genk' },

  // Centrocampistas
  { number: 13, name: 'Sofyan Amrabat', position: 'MF', age: 29, club: 'Fenerbahçe' },
  { number: 14, name: 'Azzedine Ounahi', position: 'MF', age: 26, club: 'Girona' },
  { number: 16, name: 'Neil El Aynaoui', position: 'MF', age: 24, club: 'AS Roma' },
  { number: 17, name: 'Bilal El Khannouss', position: 'MF', age: 22, club: 'VfB Stuttgart' },
  { number: 18, name: 'Ayyoub Bouaddi', position: 'MF', age: 18, club: 'Lille' },
  { number: 19, name: 'Ismael Saibari', position: 'MF', age: 25, club: 'PSV' },
  { number: 23, name: 'Samir El Mourabet', position: 'MF', age: 20, club: 'Stade Rennais' },

  // Delanteros
  { number: 15, name: 'Brahim Díaz', position: 'FW', age: 26, club: 'Real Madrid' },
  { number: 20, name: 'Chemsdine Talbi', position: 'FW', age: 21, club: 'Club Brugge' },
  { number: 21, name: 'Yassine Gessime', position: 'FW', age: 21, club: 'Dunkerque' },
  { number: 22, name: 'Ayoube Amaimouni', position: 'FW', age: 21, club: 'FAR Rabat' },
  { number: 24, name: 'Ayoub El Kaabi', position: 'FW', age: 32, club: 'Olympiacos' },
  { number: 25, name: 'Soufiane Rahimi', position: 'FW', age: 29, club: 'Al Ain' },
  { number: 26, name: 'Abde Ezzalzouli', position: 'FW', age: 24, club: 'Real Betis' }
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 4, 6, 8, 5, 13, 14, 15, 26, 24, 25]
};
