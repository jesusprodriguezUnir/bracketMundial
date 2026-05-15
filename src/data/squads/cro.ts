import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Dominik Livaković', position: 'GK', age: 31, club: 'Fenerbahçe' },
  { number: 12, name: 'Ivica Ivušić', position: 'GK', age: 31, club: 'Pafos' },
  { number: 23, name: 'Nediljko Labrović', position: 'GK', age: 27, club: 'Augsburgo' },
  { number: 2, name: 'Josip Stanišić', position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 3, name: 'Borna Sosa', position: 'DF', age: 28, club: 'Torino' },
  { number: 4, name: 'Joško Gvardiol', position: 'DF', age: 24, club: 'Manchester City' },
  { number: 5, name: 'Duje Ćaleta-Car', position: 'DF', age: 30, club: 'Lyon' },
  { number: 6, name: 'Josip Šutalo', position: 'DF', age: 26, club: 'Ajax' },
  { number: 13, name: 'Borna Barišić', position: 'DF', age: 33, club: 'Rangers' },
  { number: 14, name: 'Martin Erlić', position: 'DF', age: 28, club: 'Bologna' },
  { number: 8, name: 'Mateo Kovačić', position: 'MF', age: 32, club: 'Manchester City' },
  { number: 10, name: 'Luka Modrić', position: 'MF', age: 40, club: 'Real Madrid', captain: true },
  { number: 15, name: 'Mario Pašalić', position: 'MF', age: 31, club: 'Atalanta' },
  { number: 16, name: 'Luka Sučić', position: 'MF', age: 24, club: 'Real Sociedad' },
  { number: 17, name: 'Martin Baturina', position: 'MF', age: 23, club: 'Dinamo Zagreb' },
  { number: 18, name: 'Lovro Majer', position: 'MF', age: 28, club: 'Wolfsburg' },
  { number: 7, name: 'Andrej Kramarić', position: 'FW', age: 35, club: 'Hoffenheim' },
  { number: 9, name: 'Bruno Petković', position: 'FW', age: 32, club: 'Dinamo Zagreb' },
  { number: 11, name: 'Ivan Perišić', position: 'FW', age: 37, club: 'Hajduk Split' },
  { number: 19, name: 'Marco Pašalić', position: 'FW', age: 26, club: 'Rijeka' },
  { number: 20, name: 'Petar Musa', position: 'FW', age: 28, club: 'FC Dallas' },
  { number: 21, name: 'Dion Drena Beljo', position: 'FW', age: 24, club: 'Augsburgo' },
  { number: 22, name: 'Josip Brekalo', position: 'FW', age: 28, club: 'Fiorentina' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 6, 4, 3, 10, 8, 15, 7, 9, 11]
};