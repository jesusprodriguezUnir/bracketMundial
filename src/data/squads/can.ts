import type { Player } from './index';
export const squad: Player[] = [
  { number: 1,  name: 'Maxime Crépeau',         position: 'GK', age: 32, club: 'Portland Timbers' },
  { number: 16, name: 'Dayne St. Clair',        position: 'GK', age: 29, club: 'Minnesota United' },
  { number: 18, name: 'Owen Goodman',           position: 'GK', age: 23, club: 'Colchester United' },
  { number: 2,  name: 'Alistair Johnston',       position: 'DF', age: 27, club: 'Celtic' },
  { number: 22, name: 'Richie Laryea',           position: 'DF', age: 31, club: 'Toronto FC' },
  { number: 3,  name: 'Luc de Fougerolles',      position: 'DF', age: 20, club: 'Fulham' },
  { number: 4,  name: 'Kamal Miller',            position: 'DF', age: 29, club: 'Portland Timbers' },
  { number: 13, name: 'Derek Cornelius',         position: 'DF', age: 28, club: 'Marseille' },
  { number: 14, name: 'Moïse Bombito',           position: 'DF', age: 26, club: 'Nice' },
  { number: 15, name: 'Niko Sigur',              position: 'DF', age: 22, club: 'Hajduk Split' },
  { number: 5,  name: 'Alfie Jones',             position: 'DF', age: 28, club: 'Hull City' },
  { number: 25, name: 'Joel Waterman',           position: 'DF', age: 29, club: 'CF Montréal' },
  { number: 6,  name: 'Samuel Piette',           position: 'MF', age: 31, club: 'CF Montréal' },
  { number: 7,  name: 'Stephen Eustáquio',       position: 'MF', age: 29, club: 'Porto', captain: true },
  { number: 8,  name: 'Ismaël Koné',             position: 'MF', age: 23, club: 'Marseille' },
  { number: 21, name: 'Jonathan Osorio',         position: 'MF', age: 33, club: 'Toronto FC' },
  { number: 20, name: 'Ali Ahmed',               position: 'MF', age: 25, club: 'Vancouver Whitecaps' },
  { number: 24, name: 'Mathieu Choinière',       position: 'MF', age: 27, club: 'Grasshoppers' },
  { number: 10, name: 'Marcelo Flores',          position: 'MF', age: 22, club: 'Tigres UANL' },
  { number: 19, name: 'Alphonso Davies',         position: 'FW', age: 25, club: 'Bayern Munich' },
  { number: 9,  name: 'Cyle Larin',              position: 'FW', age: 31, club: 'Mallorca' },
  { number: 17, name: 'Tajon Buchanan',          position: 'FW', age: 27, club: 'Inter Milan' },
  { number: 11, name: 'Jonathan David',          position: 'FW', age: 26, club: 'Lille' },
  { number: 12, name: 'Jacob Shaffelburg',       position: 'FW', age: 26, club: 'Nashville SC' },
  { number: 23, name: 'Liam Millar',             position: 'FW', age: 26, club: 'Hull City' },
  { number: 26, name: 'Tani Oluwaseyi',          position: 'FW', age: 26, club: 'Minnesota United' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 14, 13, 19, 7, 8, 17, 11, 12, 9]
};

