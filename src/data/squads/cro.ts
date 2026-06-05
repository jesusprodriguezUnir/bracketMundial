import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Dominik Livakovic', position: 'GK', age: 30, club: 'Fenerbahce' },
  { number: 12, name: 'Ivor Pandur', position: 'GK', age: 26, club: 'Hull City' },
  { number: 23, name: 'Dominik Kotarski', position: 'GK', age: 25, club: 'FC Copenhagen' },
  // Defensores
  { number: 2, name: 'Josip Stanisic', position: 'DF', age: 26, club: 'Bayern Munich' },
  { number: 3, name: 'Marin Pongracic', position: 'DF', age: 28, club: 'Fiorentina' },
  { number: 4, name: 'Josko Gvardiol', position: 'DF', age: 24, club: 'Manchester City' },
  { number: 5, name: 'Duje Caleta-Car', position: 'DF', age: 30, club: 'Lyon' },
  { number: 6, name: 'Josip Sutalo', position: 'DF', age: 26, club: 'Ajax' },
  { number: 22, name: 'Luka Vuskovic', position: 'DF', age: 19, club: 'Tottenham' },
  { number: 25, name: 'Martin Erlic', position: 'DF', age: 28, club: 'Midtjylland' },
  // Volantes
  { number: 7, name: 'Nikola Moro', position: 'MF', age: 27, club: 'Bologna' },
  { number: 8, name: 'Mateo Kovacic', position: 'MF', age: 32, club: 'Manchester City' },
  { number: 10, name: 'Luka Modric', position: 'MF', age: 40, club: 'Milan', captain: true },
  { number: 13, name: 'Nikola Vlasic', position: 'MF', age: 29, club: 'Torino' },
  { number: 15, name: 'Mario Pasalic', position: 'MF', age: 30, club: 'Atalanta' },
  { number: 16, name: 'Martin Baturina', position: 'MF', age: 23, club: 'Como' },
  { number: 17, name: 'Petar Sucic', position: 'MF', age: 22, club: 'Inter' },
  { number: 18, name: 'Kristijan Jakic', position: 'MF', age: 29, club: 'Augsburg' },
  { number: 19, name: 'Toni Fruk', position: 'MF', age: 24, club: 'Rijeka' },
  { number: 21, name: 'Luka Sucic', position: 'MF', age: 23, club: 'Real Sociedad' },
  // Delanteros
  { number: 9, name: 'Andrej Kramaric', position: 'FW', age: 35, club: 'Hoffenheim' },
  { number: 11, name: 'Ante Budimir', position: 'FW', age: 34, club: 'Osasuna' },
  { number: 14, name: 'Ivan Perisic', position: 'FW', age: 37, club: 'PSV Eindhoven' },
  { number: 20, name: 'Igor Matanovic', position: 'FW', age: 23, club: 'Freiburg' },
  { number: 24, name: 'Marco Pasalic', position: 'FW', age: 25, club: 'Orlando City' },
  { number: 26, name: 'Petar Musa', position: 'FW', age: 28, club: 'FC Dallas' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 2, 5, 22, 4, 17, 9, 10, 15, 11, 14]
};
