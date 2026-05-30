import type { Player } from './index';
export const coach = 'Jesse Marsch';
export const squad: Player[] = [
  { number: 1, name: 'Maxime Crépeau', position: 'GK', age: 32, club: 'Orlando City' },
  { number: 16, name: 'Dayne St. Clair', position: 'GK', age: 29, club: 'Inter Miami' },
  { number: 18, name: 'Owen Goodman', position: 'GK', age: 23, club: 'Barnsley' },
  { number: 2, name: 'Alistair Johnston', position: 'DF', age: 27, club: 'Celtic' },
  { number: 22, name: 'Richie Laryea', position: 'DF', age: 31, club: 'Toronto FC' },
  { number: 3, name: 'Luc de Fougerolles', position: 'DF', age: 20, club: 'Fulham' },
  { number: 4, name: 'Joel Waterman', position: 'DF', age: 30, club: 'Chicago Fire' },
  { number: 13, name: 'Derek Cornelius', position: 'DF', age: 28, club: 'Marseille' },
  { number: 14, name: 'Moïse Bombito', position: 'DF', age: 26, club: 'Nice' },
  { number: 15, name: 'Niko Sigur', position: 'DF', age: 22, club: 'Hajduk Split' },
  { number: 26, name: 'Alfie Jones', position: 'DF', age: 28, club: 'Middlesbrough' },
  { number: 7, name: 'Stephen Eustáquio', position: 'MF', age: 29, club: 'Porto', captain: true },
  { number: 8, name: 'Ismaël Koné', position: 'MF', age: 23, club: 'Sassuolo' },
  { number: 21, name: 'Jonathan Osorio', position: 'MF', age: 33, club: 'Toronto FC' },
  { number: 20, name: 'Ali Ahmed', position: 'MF', age: 25, club: 'Norwich City' },
  { number: 24, name: 'Mathieu Choinière', position: 'MF', age: 27, club: 'LAFC' },
  { number: 10, name: 'Marcelo Flores', position: 'MF', age: 22, club: 'Tigres UANL' },
  { number: 27, name: 'Nathan Saliba', position: 'MF', age: 21, club: 'Anderlecht' },
  { number: 19, name: 'Alphonso Davies', position: 'DF', age: 25, club: 'Bayern Munich' },
  { number: 17, name: 'Tajon Buchanan', position: 'MF', age: 27, club: 'Villarreal' },
  { number: 12, name: 'Jacob Shaffelburg', position: 'MF', age: 26, club: 'LAFC' },
  { number: 23, name: 'Liam Millar', position: 'MF', age: 26, club: 'Hull City' },
  { number: 9, name: 'Cyle Larin', position: 'FW', age: 31, club: 'Southampton' },
  { number: 11, name: 'Jonathan David', position: 'FW', age: 26, club: 'Juventus' },
  { number: 25, name: 'Tani Oluwaseyi', position: 'FW', age: 26, club: 'Villarreal' },
  { number: 28, name: 'Promise David', position: 'FW', age: 24, club: 'Union SG' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 13, 14, 15, 7, 8, 11, 19, 17, 9]
};
