import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Yassine Bounou', position: 'GK', age: 35, club: 'Al-Hilal' },
  { number: 12, name: 'Munir El Kajoui', position: 'GK', age: 36, club: 'RS Berkane' },
  { number: 22, name: 'Ahmed Reda Tagnaouti', position: 'GK', age: 30, club: 'AS FAR Rabat' },
  // Defensores
  { number: 2, name: 'Achraf Hakimi', position: 'DF', age: 28, club: 'Paris St-Germain', captain: true },
  { number: 3, name: 'Noussair Mazraoui', position: 'DF', age: 28, club: 'Manchester United' },
  { number: 5, name: 'Nayef Aguerd', position: 'DF', age: 30, club: 'Marseille' },
  { number: 13, name: 'Zakaria El Ouahdi', position: 'DF', age: 24, club: 'Genk' },
  { number: 14, name: 'Issa Diop', position: 'DF', age: 28, club: 'Fulham' },
  { number: 18, name: 'Chadi Riad', position: 'DF', age: 22, club: 'Crystal Palace' },
  { number: 19, name: 'Youssef Belammari', position: 'DF', age: 27, club: 'Al Ahly' },
  { number: 25, name: 'Redouane Halhal', position: 'DF', age: 23, club: 'Mechelen' },
  { number: 26, name: 'Anass Salah-Eddine', position: 'DF', age: 24, club: 'Roma' },
  // Volantes
  { number: 4, name: 'Sofyan Amrabat', position: 'MF', age: 29, club: 'Real Betis' },
  { number: 6, name: 'Ayyoub Bouaddi', position: 'MF', age: 19, club: 'Lille' },
  { number: 8, name: 'Azzedine Ounahi', position: 'MF', age: 26, club: 'Girona' },
  { number: 11, name: 'Ismael Saibari', position: 'MF', age: 25, club: 'PSV Eindhoven' },
  { number: 15, name: 'Samir El Mourabet', position: 'MF', age: 21, club: 'Strasbourg' },
  { number: 16, name: 'Gessime Yassine', position: 'MF', age: 21, club: 'Strasbourg' },
  { number: 23, name: 'Bilal El Khannouss', position: 'MF', age: 21, club: 'Stuttgart' },
  { number: 24, name: 'Neil El Aynaoui', position: 'MF', age: 25, club: 'Roma' },
  // Delanteros
  { number: 7, name: 'Chemsdine Talbi', position: 'FW', age: 20, club: 'Sunderland' },
  { number: 9, name: 'Soufiane Rahimi', position: 'FW', age: 30, club: 'Al Ain' },
  { number: 10, name: 'Brahim Díaz', position: 'FW', age: 27, club: 'Real Madrid' },
  { number: 17, name: 'Abdessamad Ezzalzouli', position: 'FW', age: 24, club: 'Real Betis' },
  { number: 20, name: 'Ayoub El Kaabi', position: 'FW', age: 32, club: 'Olympiakos' },
  { number: 21, name: 'Ayoube Amaimouni', position: 'FW', age: 21, club: 'Eintracht Frankfurt' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 3, 5, 14, 2, 4, 8, 10, 17, 20, 9]
};
