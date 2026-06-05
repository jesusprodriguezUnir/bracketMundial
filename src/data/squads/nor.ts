import type { Player } from './index';

export const squad: Player[] = [
  // Porteros
  { number: 1, name: 'Ørjan Håskjold Nyland', position: 'GK', age: 35, club: 'Sevilla' },
  { number: 12, name: 'Sander Tangvik', position: 'GK', age: 23, club: 'Hamburg' },
  { number: 13, name: 'Egil Selvik', position: 'GK', age: 28, club: 'Watford' },
  // Defensores
  { number: 3, name: 'Kristoffer Ajer', position: 'DF', age: 28, club: 'Brentford' },
  { number: 4, name: 'Leo Østigård', position: 'DF', age: 26, club: 'Genoa' },
  { number: 5, name: 'David Møller Wolfe', position: 'DF', age: 24, club: 'Wolves' },
  { number: 15, name: 'Fredrik André Bjørkan', position: 'DF', age: 27, club: 'Bodø/Glimt' },
  { number: 16, name: 'Marcus Holmgren Pedersen', position: 'DF', age: 25, club: 'Torino' },
  { number: 17, name: 'Torbjørn Heggem', position: 'DF', age: 26, club: 'Bologna' },
  { number: 24, name: 'Sondre Langås', position: 'DF', age: 25, club: 'Derby County' },
  { number: 25, name: 'Henrik Falchener', position: 'DF', age: 22, club: 'Viking' },
  { number: 26, name: 'Julian Ryerson', position: 'DF', age: 28, club: 'Borussia Dortmund' },
  // Volantes
  { number: 2, name: 'Morten Thorsby', position: 'MF', age: 30, club: 'Cremonese' },
  { number: 6, name: 'Patrick Berg', position: 'MF', age: 28, club: 'Bodø/Glimt' },
  { number: 8, name: 'Sander Berge', position: 'MF', age: 28, club: 'Fulham' },
  { number: 10, name: 'Martin Ødegaard', position: 'MF', age: 27, club: 'Arsenal', captain: true },
  { number: 14, name: 'Fredrik Aursnes', position: 'MF', age: 30, club: 'Benfica' },
  { number: 18, name: 'Kristian Thorstvedt', position: 'MF', age: 27, club: 'Sassuolo' },
  { number: 19, name: 'Thelo Aasgaard', position: 'MF', age: 24, club: 'Rangers' },
  // Delanteros
  { number: 7, name: 'Alexander Sørloth', position: 'FW', age: 31, club: 'Atlético Madrid' },
  { number: 9, name: 'Erling Haaland', position: 'FW', age: 25, club: 'Manchester City' },
  { number: 11, name: 'Jørgen Strand Larsen', position: 'FW', age: 26, club: 'Crystal Palace' },
  { number: 20, name: 'Antonio Nusa', position: 'FW', age: 21, club: 'RB Leipzig' },
  { number: 21, name: 'Andreas Schjelderup', position: 'FW', age: 22, club: 'Benfica' },
  { number: 22, name: 'Oscar Bobb', position: 'FW', age: 22, club: 'Fulham' },
  { number: 23, name: 'Jens Petter Hauge', position: 'FW', age: 26, club: 'Bodø/Glimt' },
];

export const lineup = {
  formation: '4-3-3',
  startingXI: [1, 26, 3, 4, 5, 8, 10, 18, 7, 9, 20]
};
