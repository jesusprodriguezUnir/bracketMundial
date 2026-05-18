import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alexander Schlager', position: 'GK', age: 30, club: 'RB Salzburg' },
  { number: 12, name: 'Florian Wiegele', position: 'GK', age: 24, club: 'Viktoria Plzen' },
  { number: 23, name: 'Patrick Pentz', position: 'GK', age: 29, club: 'Brondby IF' },
  // Defensas
  { number: 2, name: 'Stefan Posch', position: 'DF', age: 29, club: 'Mainz 05' },
  { number: 3, name: 'David Alaba', position: 'DF', age: 34, club: 'Real Madrid', captain: true },
  { number: 4, name: 'Kevin Danso', position: 'DF', age: 28, club: 'Tottenham Hotspur' },
  { number: 5, name: 'David Affengruber', position: 'DF', age: 25, club: 'Elche' },
  { number: 13, name: 'Phillipp Mwene', position: 'DF', age: 32, club: 'Mainz 05' },
  { number: 14, name: 'Philipp Lienhart', position: 'DF', age: 29, club: 'Freiburg' },
  { number: 15, name: 'Alexander Prass', position: 'DF', age: 25, club: 'Hoffenheim' },
  { number: 19, name: 'Marco Friedl', position: 'DF', age: 28, club: 'Werder Bremen' },
  { number: 20, name: 'Michael Svoboda', position: 'DF', age: 27, club: 'Venezia' },
  // Mediocampistas
  { number: 6, name: 'Nicolas Seiwald', position: 'MF', age: 25, club: 'RB Leipzig' },
  { number: 8, name: 'Konrad Laimer', position: 'MF', age: 29, club: 'Bayern Munich' },
  { number: 10, name: 'Marcel Sabitzer', position: 'MF', age: 32, club: 'Borussia Dortmund' },
  { number: 16, name: 'Christoph Baumgartner', position: 'MF', age: 27, club: 'RB Leipzig' },
  { number: 17, name: 'Romano Schmid', position: 'MF', age: 26, club: 'Werder Bremen' },
  { number: 18, name: 'Xaver Schlager', position: 'MF', age: 29, club: 'RB Leipzig' },
  { number: 22, name: 'Florian Grillitsch', position: 'MF', age: 30, club: 'Braga' },
  { number: 24, name: 'Carney Chukwuemeka', position: 'MF', age: 22, club: 'Borussia Dortmund' },
  { number: 25, name: 'Paul Wanner', position: 'MF', age: 20, club: 'PSV' },
  { number: 26, name: 'Alessandro Schöpf', position: 'MF', age: 32, club: 'Wolfsberger' },
  { number: 11, name: 'Patrick Wimmer', position: 'MF', age: 25, club: 'Wolfsburg' },
  // Delanteros
  { number: 7, name: 'Marko Arnautović', position: 'FW', age: 37, club: 'Estrella Roja' },
  { number: 9, name: 'Michael Gregoritsch', position: 'FW', age: 32, club: 'Augsburg' },
  { number: 21, name: 'Saša Kalajdžić', position: 'FW', age: 29, club: 'LASK' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 3, 13, 6, 8, 11, 16, 10, 9]
};