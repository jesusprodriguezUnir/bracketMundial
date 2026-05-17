import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Dominik Livaković', position: 'GK', age: 31, club: 'Fenerbahçe' },
  { number: 12, name: 'Dominik Kotarski', position: 'GK', age: 26, club: 'PAOK' },
  { number: 23, name: 'Ivor Pandur', position: 'GK', age: 26, club: 'Torino' },
  { number: 2, name: 'Josip Stanišić', position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 4, name: 'Joško Gvardiol', position: 'DF', age: 24, club: 'Manchester City' },
  { number: 5, name: 'Duje Ćaleta-Car', position: 'DF', age: 30, club: 'Sion' },
  { number: 6, name: 'Josip Šutalo', position: 'DF', age: 26, club: 'Ajax' },
  { number: 13, name: 'Kristijan Jakić', position: 'DF', age: 29, club: 'Red Bull Salzburg' },
  { number: 24, name: 'Martin Erlić', position: 'DF', age: 28, club: 'Bologna' },
  { number: 25, name: 'Luka Vušković', position: 'DF', age: 19, club: 'Hajduk Split' },
  { number: 26, name: 'Marin Pongračić', position: 'DF', age: 29, club: 'Lazio' },
  { number: 8, name: 'Mateo Kovačić', position: 'MF', age: 32, club: 'Manchester City' },
  { number: 10, name: 'Luka Modrić', position: 'MF', age: 40, club: 'Real Madrid', captain: true },
  { number: 11, name: 'Nikola Vlašić', position: 'MF', age: 29, club: 'Torino' },
  { number: 17, name: 'Martin Baturina', position: 'MF', age: 23, club: 'Dinamo Zagreb' },
  { number: 18, name: 'Lovro Majer', position: 'MF', age: 28, club: 'Wolfsburg' },
  { number: 19, name: 'Mario Pašalić', position: 'MF', age: 31, club: 'Atalanta' },
  { number: 20, name: 'Petar Sučić', position: 'MF', age: 22, club: 'Red Bull Salzburg' },
  { number: 21, name: 'Luka Sučić', position: 'MF', age: 24, club: 'Real Sociedad' },
  { number: 7, name: 'Andrej Kramarić', position: 'FW', age: 35, club: 'Hoffenheim' },
  { number: 9, name: 'Ante Budimir', position: 'FW', age: 34, club: 'Osasuna' },
  { number: 3, name: 'Ivan Perišić', position: 'FW', age: 37, club: 'Hajduk Split' },
  { number: 22, name: 'Igor Matanović', position: 'FW', age: 23, club: 'Eintracht Frankfurt' },
  { number: 27, name: 'Bruno Petković', position: 'FW', age: 32, club: 'Dinamo Zagreb' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 6, 4, 13, 10, 8, 19, 7, 9, 3]
};
