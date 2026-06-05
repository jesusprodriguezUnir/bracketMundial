import type { Player } from './index';

export const coach = 'Jesse Marsch';
export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Dayne St. Clair', position: 'GK', age: 28, club: 'Inter Miami' },
  { number: 16, name: 'Maxime Crépeau', position: 'GK', age: 31, club: 'Orlando City' },
  { number: 18, name: 'Owen Goodman', position: 'GK', age: 23, club: 'Crystal Palace' },
  // Defensores
  { number: 2, name: 'Alistair Johnston', position: 'DF', age: 27, club: 'Celtic' },
  { number: 3, name: 'Alfie Jones', position: 'DF', age: 28, club: 'Middlesbrough' },
  { number: 4, name: 'Luc De Fougerolles', position: 'DF', age: 20, club: 'Fulham' },
  { number: 5, name: 'Joel Waterman', position: 'DF', age: 30, club: 'Chicago Fire' },
  { number: 13, name: 'Derek Cornelius', position: 'DF', age: 28, club: 'Marseille' },
  { number: 15, name: 'Moïse Bombito', position: 'DF', age: 26, club: 'Nice' },
  { number: 19, name: 'Alphonso Davies', position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 22, name: 'Richie Laryea', position: 'DF', age: 30, club: 'Toronto FC' },
  { number: 23, name: 'Niko Sigur', position: 'DF', age: 22, club: 'Hajduk Split' },
  // Volantes
  { number: 6, name: 'Mathieu Choinière', position: 'MF', age: 26, club: 'Los Angeles FC' },
  { number: 7, name: 'Stephen Eustáquio', position: 'MF', age: 29, club: 'Porto', captain: true },
  { number: 8, name: 'Ismaël Koné', position: 'MF', age: 23, club: 'Sassuolo' },
  { number: 14, name: 'Jacob Shaffelburg', position: 'MF', age: 26, club: 'Los Angeles FC' },
  { number: 21, name: 'Jonathan Osorio', position: 'MF', age: 33, club: 'Toronto FC' },
  { number: 25, name: 'Nathan-Dylan Saliba', position: 'MF', age: 21, club: 'Anderlecht' },
  // Delanteros
  { number: 9, name: 'Cyle Larin', position: 'FW', age: 31, club: 'Mallorca' },
  { number: 10, name: 'Jonathan David', position: 'FW', age: 26, club: 'Juventus' },
  { number: 11, name: 'Liam Millar', position: 'FW', age: 26, club: 'Hull City' },
  { number: 12, name: 'Tani Oluwaseyi', position: 'FW', age: 26, club: 'Villarreal' },
  { number: 17, name: 'Tajon Buchanan', position: 'FW', age: 26, club: 'Villarreal' },
  { number: 20, name: 'Ali Ahmed', position: 'FW', age: 25, club: 'Norwich City' },
  { number: 24, name: 'Promise David', position: 'FW', age: 25, club: 'Union Saint-Gilloise' },
  { number: 26, name: 'Marcelo Flores', position: 'FW', age: 23, club: 'Tigres UANL' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [16, 2, 13, 15, 23, 7, 8, 10, 19, 17, 9]
};
