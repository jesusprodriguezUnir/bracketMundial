import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Mert Gunok', position: 'GK', age: 37, club: 'Fenerbahce' },
  { number: 12, name: 'Altay Bayindir', position: 'GK', age: 28, club: 'Manchester United' },
  { number: 23, name: 'Ugurcan Cakir', position: 'GK', age: 30, club: 'Galatasaray' },
  // Defensores
  { number: 2, name: 'Zeki Celik', position: 'DF', age: 29, club: 'Roma' },
  { number: 3, name: 'Merih Demiral', position: 'DF', age: 28, club: 'Al-Ahli' },
  { number: 4, name: 'Caglar Soyuncu', position: 'DF', age: 30, club: 'Fenerbahce' },
  { number: 13, name: 'Eren Elmali', position: 'DF', age: 25, club: 'Galatasaray' },
  { number: 14, name: 'Abdulkerim Bardakci', position: 'DF', age: 31, club: 'Galatasaray' },
  { number: 15, name: 'Ozan Kabak', position: 'DF', age: 26, club: 'Hoffenheim' },
  { number: 18, name: 'Mert Muldur', position: 'DF', age: 27, club: 'Fenerbahce' },
  { number: 20, name: 'Ferdi Kadioglu', position: 'DF', age: 26, club: 'Brighton' },
  { number: 22, name: 'Kaan Ayhan', position: 'DF', age: 31, club: 'Galatasaray' },
  { number: 25, name: 'Samet Akaydin', position: 'DF', age: 32, club: 'Caykur Rizespor' },
  // Volantes
  { number: 5, name: 'Salih Özcan', position: 'MF', age: 27, club: 'Borussia Dortmund' },
  { number: 6, name: 'Orkun Kokcu', position: 'MF', age: 25, club: 'Besiktas' },
  { number: 8, name: 'Arda Guler', position: 'MF', age: 21, club: 'Real Madrid' },
  { number: 10, name: 'Hakan Calhanoglu', position: 'MF', age: 31, club: 'Inter', captain: true },
  { number: 16, name: 'Ismail Yuksek', position: 'MF', age: 27, club: 'Fenerbahce' },
  { number: 26, name: 'Can Uzun', position: 'MF', age: 20, club: 'Eintracht Frankfurt' },
  // Delanteros
  { number: 7, name: 'Kerem Akturkoglu', position: 'FW', age: 27, club: 'Fenerbahce' },
  { number: 9, name: 'Deniz Gul', position: 'FW', age: 22, club: 'Porto' },
  { number: 11, name: 'Kenan Yildiz', position: 'FW', age: 21, club: 'Juventus' },
  { number: 17, name: 'Irfan Can Kahveci', position: 'FW', age: 30, club: 'Fenerbahce' },
  { number: 19, name: 'Yunus Akgun', position: 'FW', age: 25, club: 'Galatasaray' },
  { number: 21, name: 'Baris Alper Yilmaz', position: 'FW', age: 26, club: 'Galatasaray' },
  { number: 24, name: 'Oguz Aydin', position: 'FW', age: 25, club: 'Fenerbahce' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 3, 14, 20, 16, 10, 8, 6, 11, 21]
};
