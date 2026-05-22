import type { Player } from './index';
export const squad: Player[] = [
  { number: 1, name: 'Ørjan Håskjold Nyland', position: 'GK', age: 35, club: 'Sevilla' },
  { number: 12, name: 'Egil Selvik', position: 'GK', age: 28, club: 'Watford' },
  { number: 13, name: 'Sander Tangvik', position: 'GK', age: 23, club: 'Hamburger SV' },
  { number: 14, name: 'Julian Ryerson', position: 'DF', age: 28, club: 'Borussia Dortmund' },
  { number: 5, name: 'David Møller Wolfe', position: 'DF', age: 24, club: 'Wolverhampton' },
  { number: 4, name: 'Leo Østigård', position: 'DF', age: 26, club: 'Genoa' },
  { number: 3, name: 'Kristoffer Vassbakk Ajer', position: 'DF', age: 28, club: 'Brentford' },
  { number: 16, name: 'Marcus Holmgren Pedersen', position: 'DF', age: 25, club: 'Torino' },
  { number: 15, name: 'Fredrik Bjørkan', position: 'DF', age: 27, club: 'Bodø/Glimt' },
  { number: 24, name: 'Henrik Falchener', position: 'DF', age: 23, club: 'Viking' },
  { number: 25, name: 'Sondre Langås', position: 'DF', age: 25, club: 'Derby County' },
  { number: 17, name: 'Torbjørn Heggem', position: 'DF', age: 27, club: 'Bologna' },
  { number: 6, name: 'Patrick Berg', position: 'MF', age: 28, club: 'Bodø/Glimt' },
  { number: 8, name: 'Sander Berge', position: 'MF', age: 28, club: 'Fulham' },
  { number: 10, name: 'Martin Ødegaard', position: 'MF', age: 27, club: 'Arsenal', captain: true },
  { number: 2, name: 'Morten Thorsby', position: 'MF', age: 30, club: 'Cremonese' },
  { number: 18, name: 'Kristian Thorstvedt', position: 'MF', age: 27, club: 'Sassuolo' },
  { number: 23, name: 'Fredrik Aursnes', position: 'MF', age: 30, club: 'Benfica' },
  { number: 19, name: 'Jens Petter Hauge', position: 'MF', age: 26, club: 'Bodø/Glimt' },
  { number: 26, name: 'Thelonious Aasgaard', position: 'MF', age: 24, club: 'Rangers' },
  { number: 20, name: 'Antonio Nusa', position: 'MF', age: 21, club: 'RB Leipzig' },
  { number: 22, name: 'Oscar Bobb', position: 'MF', age: 22, club: 'Fulham' },
  { number: 21, name: 'Andreas Schjelderup', position: 'MF', age: 21, club: 'Benfica' },
  { number: 7, name: 'Alexander Sørloth', position: 'FW', age: 30, club: 'Atlético de Madrid' },
  { number: 9, name: 'Erling Braut Haaland', position: 'FW', age: 25, club: 'Manchester City' },
  { number: 11, name: 'Jørgen Strand Larsen', position: 'FW', age: 26, club: 'Crystal Palace' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 14, 3, 4, 5, 8, 10, 18, 7, 9, 20]
};
