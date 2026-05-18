import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Matthieu Epolo',       position: 'GK', age: 23, club: 'Standard de Lieja' },
  { number: 12, name: 'Lionel Mpasi',          position: 'GK', age: 32, club: 'Le Havre' },
  { number: 23, name: 'Timothy Fayulu',        position: 'GK', age: 24, club: 'Noah' },
  { number: 2,  name: 'Gedeon Kalulu',         position: 'DF', age: 30, club: 'Aris Limassol' },
  { number: 3,  name: 'Arthur Masuaku',        position: 'DF', age: 33, club: 'Racing Lens' },
  { number: 4,  name: 'Chancel Mbemba',        position: 'DF', age: 31, club: 'Lille', captain: true },
  { number: 5,  name: 'Dylan Batubinsika',     position: 'DF', age: 29, club: 'Larissa' },
  { number: 13, name: 'Rocky Bushiri',         position: 'DF', age: 26, club: 'Hibernian' },
  { number: 14, name: 'Joris Kayembe',         position: 'DF', age: 31, club: 'Racing Genk' },
  { number: 15, name: 'Steve Kapuadi',         position: 'DF', age: 27, club: 'Widzew Łódź' },
  { number: 24, name: 'Axel Tuanzebe',         position: 'DF', age: 28, club: 'Burnley' },
  { number: 25, name: 'Aaron Wan-Bissaka',     position: 'DF', age: 28, club: 'West Ham United' },
  { number: 6,  name: 'Samuel Moutoussamy',    position: 'MF', age: 29, club: 'Atromitos' },
  { number: 8,  name: 'Edo Kayembe',           position: 'MF', age: 27, club: 'Watford' },
  { number: 10, name: 'Gaël Kakuta',           position: 'MF', age: 35, club: 'Larissa' },
  { number: 16, name: 'Charles Pickel',        position: 'MF', age: 28, club: 'Espanyol' },
  { number: 17, name: 'Meschack Elia',         position: 'MF', age: 29, club: 'Alanyaspor' },
  { number: 18, name: 'Theo Bongonda',         position: 'MF', age: 31, club: 'Spartak Moscú' },
  { number: 19, name: 'Brian Cipenga',         position: 'MF', age: 25, club: 'Castellón' },
  { number: 21, name: 'Nathanaël Mbuku',       position: 'MF', age: 24, club: 'Montpellier' },
  { number: 22, name: 'Ngalayel Mukau',        position: 'MF', age: 21, club: 'Lille' },
  { number: 26, name: 'Noah Sadiki',           position: 'MF', age: 23, club: 'Sunderland' },
  { number: 7,  name: 'Yoane Wissa',           position: 'FW', age: 29, club: 'Newcastle United' },
  { number: 9,  name: 'Cédric Bakambu',        position: 'FW', age: 34, club: 'Real Betis' },
  { number: 11, name: 'Simon Banza',           position: 'FW', age: 30, club: 'Al Jazira' },
  { number: 20, name: 'Fiston Mayele',         position: 'FW', age: 32, club: 'Pyramids' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 5, 3, 6, 16, 18, 10, 17, 9]
};
