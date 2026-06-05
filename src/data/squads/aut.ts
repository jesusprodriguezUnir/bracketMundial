import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Alexander Schlager', position: 'GK', age: 30, club: 'Red Bull Salzburg' },
  { number: 12, name: 'Florian Wiegele', position: 'GK', age: 24, club: 'Viktoria Plzeň' },
  { number: 13, name: 'Patrick Pentz', position: 'GK', age: 29, club: 'Brøndby' },
  // Defensores
  { number: 2, name: 'David Affengruber', position: 'DF', age: 25, club: 'Elche' },
  { number: 3, name: 'Kevin Danso', position: 'DF', age: 28, club: 'Tottenham' },
  { number: 5, name: 'Stefan Posch', position: 'DF', age: 29, club: 'Como' },
  { number: 8, name: 'David Alaba', position: 'DF', age: 34, club: 'Real Madrid', captain: true },
  { number: 15, name: 'Philipp Lienhart', position: 'DF', age: 29, club: 'Freiburg' },
  { number: 16, name: 'Phillipp Mwene', position: 'DF', age: 32, club: 'Mainz 05' },
  { number: 22, name: 'Alexander Prass', position: 'DF', age: 25, club: 'Hoffenheim' },
  { number: 23, name: 'Marco Friedl', position: 'DF', age: 28, club: 'Werder Bremen' },
  { number: 25, name: 'Michael Svoboda', position: 'DF', age: 27, club: 'Venezia' },
  // Volantes
  { number: 4, name: 'Xaver Schlager', position: 'MF', age: 29, club: 'RB Leipzig' },
  { number: 6, name: 'Nicolas Seiwald', position: 'MF', age: 25, club: 'RB Leipzig' },
  { number: 9, name: 'Marcel Sabitzer', position: 'MF', age: 32, club: 'Borussia Dortmund' },
  { number: 10, name: 'Florian Grillitsch', position: 'MF', age: 30, club: 'Sporting Braga' },
  { number: 17, name: 'Carney Chukwuemeka', position: 'MF', age: 22, club: 'Borussia Dortmund' },
  { number: 18, name: 'Romano Schmid', position: 'MF', age: 26, club: 'Werder Bremen' },
  { number: 19, name: 'Christoph Baumgartner', position: 'MF', age: 27, club: 'RB Leipzig' },
  { number: 20, name: 'Konrad Laimer', position: 'MF', age: 29, club: 'Bayern Munich' },
  { number: 21, name: 'Patrick Wimmer', position: 'MF', age: 25, club: 'Wolfsburg' },
  { number: 24, name: 'Paul Wanner', position: 'MF', age: 20, club: 'PSV Eindhoven' },
  { number: 26, name: 'Alessandro Schöpf', position: 'MF', age: 31, club: 'Wolfsberger' },
  // Delanteros
  { number: 7, name: 'Marko Arnautović', position: 'FW', age: 37, club: 'Red Star Belgrade' },
  { number: 11, name: 'Michael Gregoritsch', position: 'FW', age: 32, club: 'Brøndby' },
  { number: 14, name: 'Saša Kalajdžić', position: 'FW', age: 28, club: 'Wolves' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 5, 3, 8, 16, 6, 20, 21, 19, 9, 11]
};
