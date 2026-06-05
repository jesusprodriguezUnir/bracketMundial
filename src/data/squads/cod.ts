import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Lionel Mpasi', position: 'GK', age: 32, club: 'Le Havre' },
  { number: 16, name: 'Timothy Fayulu', position: 'GK', age: 24, club: 'FC Noah' },
  { number: 21, name: 'Matthieu Epolo', position: 'GK', age: 23, club: 'Standard Liège' },
  // Defensores
  { number: 2, name: 'Aaron Wan-Bissaka', position: 'DF', age: 28, club: 'West Ham' },
  { number: 3, name: 'Steve Kapuadi', position: 'DF', age: 27, club: 'Widzew Lodz' },
  { number: 4, name: 'Axel Tuanzebe', position: 'DF', age: 28, club: 'Burnley' },
  { number: 5, name: 'Dylan Batubinsika', position: 'DF', age: 29, club: 'AE Larissa' },
  { number: 12, name: 'Joris Kayembe', position: 'DF', age: 31, club: 'Genk' },
  { number: 15, name: 'Aaron Tshibola', position: 'DF', age: 31, club: 'Kilmarnock' },
  { number: 22, name: 'Chancel Mbemba', position: 'DF', age: 31, club: 'Lille', captain: true },
  { number: 24, name: 'Gédéon Kalulu', position: 'DF', age: 30, club: 'Aris Limassol' },
  { number: 26, name: 'Arthur Masuaku', position: 'DF', age: 32, club: 'Lens' },
  // Volantes
  { number: 6, name: 'Ngal’ayel Mukau', position: 'MF', age: 22, club: 'Lille' },
  { number: 8, name: 'Samuel Moutoussamy', position: 'MF', age: 29, club: 'Atromitos' },
  { number: 11, name: 'Gaël Kakuta', position: 'MF', age: 35, club: 'AE Larissa' },
  { number: 14, name: 'Noah Sadiki', position: 'MF', age: 23, club: 'Sunderland' },
  { number: 18, name: 'Charles Pickel', position: 'MF', age: 28, club: 'Espanyol' },
  { number: 25, name: 'Edo Kayembe', position: 'MF', age: 28, club: 'Watford' },
  // Delanteros
  { number: 7, name: 'Nathanaël Mbuku', position: 'FW', age: 24, club: 'Montpellier' },
  { number: 9, name: 'Brian Cipenga', position: 'FW', age: 27, club: 'Castellón' },
  { number: 10, name: 'Théo Bongonda', position: 'FW', age: 31, club: 'Spartak Moscow' },
  { number: 13, name: 'Meschack Elia', position: 'FW', age: 29, club: 'Alanyaspor' },
  { number: 17, name: 'Cédric Bakambu', position: 'FW', age: 34, club: 'Real Betis' },
  { number: 19, name: 'Fiston Mayele', position: 'FW', age: 32, club: 'Pyramids' },
  { number: 20, name: 'Yoane Wissa', position: 'FW', age: 30, club: 'Newcastle' },
  { number: 23, name: 'Simon Banza', position: 'FW', age: 30, club: 'Al Jazira' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [21, 2, 22, 4, 26, 7, 8, 14, 13, 17, 20]
};
