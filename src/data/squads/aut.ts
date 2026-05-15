import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Alexander Schlager', position: 'GK', age: 30, club: 'RB Salzburg' },
  { number: 12, name: 'Heinz Lindner', position: 'GK', age: 36, club: 'Union Saint-Gilloise' },
  { number: 23, name: 'Niklas Hedl', position: 'GK', age: 25, club: 'Rapid Wien' },
  { number: 2, name: 'Stefan Posch', position: 'DF', age: 29, club: 'Bologna' },
  { number: 3, name: 'David Alaba', position: 'DF', age: 34, club: 'Real Madrid', captain: true },
  { number: 4, name: 'Kevin Danso', position: 'DF', age: 28, club: 'Lens' },
  { number: 5, name: 'Maximilian Wöber', position: 'DF', age: 28, club: 'Leeds United' },
  { number: 13, name: 'Phillip Mwene', position: 'DF', age: 32, club: 'Mainz 05' },
  { number: 14, name: 'Leopold Querfeld', position: 'DF', age: 23, club: 'Union Berlin' },
  { number: 15, name: 'Gernot Trauner', position: 'DF', age: 34, club: 'Feyenoord' },
  { number: 6, name: 'Nicolas Seiwald', position: 'MF', age: 25, club: 'RB Leipzig' },
  { number: 8, name: 'Konrad Laimer', position: 'MF', age: 29, club: 'Bayern Munich' },
  { number: 10, name: 'Marcel Sabitzer', position: 'MF', age: 32, club: 'Borussia Dortmund' },
  { number: 16, name: 'Christoph Baumgartner', position: 'MF', age: 27, club: 'RB Leipzig' },
  { number: 17, name: 'Romano Schmid', position: 'MF', age: 26, club: 'Werder Bremen' },
  { number: 18, name: 'Xaver Schlager', position: 'MF', age: 29, club: 'RB Leipzig' },
  { number: 7, name: 'Marko Arnautović', position: 'FW', age: 37, club: 'Inter' },
  { number: 9, name: 'Michael Gregoritsch', position: 'FW', age: 32, club: 'Freiburg' },
  { number: 11, name: 'Patrick Wimmer', position: 'FW', age: 25, club: 'Wolfsburg' },
  { number: 19, name: 'Junior Adamu', position: 'FW', age: 25, club: 'Freiburg' },
  { number: 20, name: 'Andreas Weimann', position: 'FW', age: 35, club: 'Blackburn Rovers' },
  { number: 21, name: 'Sasa Kalajdzic', position: 'FW', age: 29, club: 'Wolverhampton' },
  { number: 22, name: 'Florian Kainz', position: 'FW', age: 34, club: 'Köln' },
];

export const lineup = {
  formation: '4-2-3-1',
  startingXI: [1, 2, 4, 3, 13, 6, 8, 11, 16, 10, 9]
};